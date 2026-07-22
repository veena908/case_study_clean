import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { CreateProductInput, StockMovementInput, UpdateProductInput } from "./schema";

interface ListParams {
  skip: number;
  take: number;
  search?: string;
  category?: string;
  lowStock?: boolean;
}

export async function listProducts(params: ListParams) {
  const where: Prisma.ProductWhereInput = {};
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { sku: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params.category) where.category = params.category;

  const [allMatching, total] = await Promise.all([
    params.lowStock
      ? prisma.product.findMany({ where })
      : prisma.product.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: "desc" } }),
    prisma.product.count({ where }),
  ]);

  if (params.lowStock) {
    const filtered = allMatching.filter((p) => p.currentStock <= p.minStockAlert);
    const page = filtered.slice(params.skip, params.skip + params.take);
    return { data: page, total: filtered.length };
  }

  return { data: allMatching, total };
}

export async function createProduct(input: CreateProductInput) {
  return prisma.product.create({ data: input });
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError("Product not found", 404);
  return product;
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  await getProductById(id);
  return prisma.product.update({ where: { id }, data: input });
}

export async function recordStockMovement(productId: string, input: StockMovementInput, createdById: string) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError("Product not found", 404);

    const delta = input.movementType === "IN" ? input.quantityChanged : -input.quantityChanged;
    const newStock = product.currentStock + delta;
    if (newStock < 0) {
      throw new AppError("Stock cannot go negative for this product", 409);
    }

    const [movement, updatedProduct] = await Promise.all([
      tx.stockMovement.create({
        data: {
          productId,
          quantityChanged: input.quantityChanged,
          movementType: input.movementType,
          reason: input.reason,
          createdById,
        },
      }),
      tx.product.update({ where: { id: productId }, data: { currentStock: newStock } }),
    ]);

    return { movement, product: updatedProduct };
  });
}

export async function listStockMovements(productId: string) {
  await getProductById(productId);
  return prisma.stockMovement.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { name: true } } },
  });
}
