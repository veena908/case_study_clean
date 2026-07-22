import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { CreateChallanInput, UpdateChallanInput } from "./schema";

interface ListParams {
  skip: number;
  take: number;
  status?: string;
  customerId?: string;
}

async function generateChallanNumber(tx: Prisma.TransactionClient) {
  const count = await tx.challan.count();
  return `CH-${String(count + 1).padStart(6, "0")}`;
}

async function buildSnapshotItems(tx: Prisma.TransactionClient, items: { productId: string; quantity: number }[]) {
  const productIds = items.map((i) => i.productId);
  const products = await tx.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const snapshotItems = items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new AppError(`Product ${item.productId} not found`, 404);
    }
    return {
      productId: product.id,
      productNameSnapshot: product.name,
      productSkuSnapshot: product.sku,
      unitPriceSnapshot: product.unitPrice,
      quantity: item.quantity,
    };
  });

  return { snapshotItems, productMap };
}

async function reduceStockForItems(
  tx: Prisma.TransactionClient,
  items: { productId: string; quantity: number }[],
  createdById: string,
  productMap?: Map<string, { id: string; name: string; currentStock: number }>
) {
  const map =
    productMap ??
    new Map(
      (await tx.product.findMany({ where: { id: { in: items.map((i) => i.productId) } } })).map((p) => [p.id, p])
    );

  for (const item of items) {
    const product = map.get(item.productId);
    if (!product) {
      throw new AppError(`Product ${item.productId} not found`, 404);
    }
    const newStock = product.currentStock - item.quantity;
    if (newStock < 0) {
      throw new AppError(
        `Insufficient stock for "${product.name}" (available: ${product.currentStock}, requested: ${item.quantity})`,
        409
      );
    }
    await tx.product.update({ where: { id: product.id }, data: { currentStock: newStock } });
  }

  await tx.stockMovement.createMany({
    data: items.map((item) => ({
      productId: item.productId,
      quantityChanged: item.quantity,
      movementType: "OUT",
      reason: "Sales challan confirmed",
      createdById,
    })),
  });
}

async function restockForItems(
  tx: Prisma.TransactionClient,
  items: { productId: string | null; quantity: number }[],
  createdById: string
) {
  const validItems = items.filter((i): i is { productId: string; quantity: number } => !!i.productId);
  if (validItems.length === 0) return;

  const products = await tx.product.findMany({ where: { id: { in: validItems.map((i) => i.productId) } } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of validItems) {
    const product = productMap.get(item.productId);
    if (!product) continue;
    await tx.product.update({
      where: { id: product.id },
      data: { currentStock: product.currentStock + item.quantity },
    });
  }

  await tx.stockMovement.createMany({
    data: validItems.map((item) => ({
      productId: item.productId,
      quantityChanged: item.quantity,
      movementType: "IN",
      reason: "Sales challan cancelled - stock reversed",
      createdById,
    })),
  });
}

export async function listChallans(params: ListParams) {
  const where: Prisma.ChallanWhereInput = {};
  if (params.status) where.status = params.status as never;
  if (params.customerId) where.customerId = params.customerId;

  const [data, total] = await Promise.all([
    prisma.challan.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true, businessName: true } }, items: true },
    }),
    prisma.challan.count({ where }),
  ]);

  return { data, total };
}

export async function createChallan(input: CreateChallanInput, createdById: string) {
  return prisma.$transaction(
    async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id: input.customerId } });
      if (!customer) throw new AppError("Customer not found", 404);

      const { snapshotItems, productMap } = await buildSnapshotItems(tx, input.items);
      const totalQuantity = snapshotItems.reduce((sum, i) => sum + i.quantity, 0);
      const challanNumber = await generateChallanNumber(tx);

      const challan = await tx.challan.create({
        data: {
          challanNumber,
          customerId: input.customerId,
          totalQuantity,
          status: "DRAFT",
          createdById,
          items: { create: snapshotItems },
        },
        include: { items: true, customer: true },
      });

      if (input.status === "CONFIRMED") {
        await reduceStockForItems(
          tx,
          snapshotItems.map((i) => ({ productId: i.productId!, quantity: i.quantity })),
          createdById,
          productMap
        );
        return tx.challan.update({
          where: { id: challan.id },
          data: { status: "CONFIRMED" },
          include: { items: true, customer: true },
        });
      }

      return challan;
    },
    { timeout: 15000 }
  );
}

export async function getChallanById(id: string) {
  const challan = await prisma.challan.findUnique({
    where: { id },
    include: { items: true, customer: true, createdBy: { select: { name: true } } },
  });
  if (!challan) throw new AppError("Challan not found", 404);
  return challan;
}

export async function updateChallan(id: string, input: UpdateChallanInput) {
  return prisma.$transaction(
    async (tx) => {
      const existing = await tx.challan.findUnique({ where: { id } });
      if (!existing) throw new AppError("Challan not found", 404);
      if (existing.status !== "DRAFT") {
        throw new AppError("Only draft challans can be edited", 409);
      }

      let totalQuantity = existing.totalQuantity;
      if (input.items) {
        const { snapshotItems } = await buildSnapshotItems(tx, input.items);
        totalQuantity = snapshotItems.reduce((sum, i) => sum + i.quantity, 0);
        await tx.challanItem.deleteMany({ where: { challanId: id } });
        await tx.challan.update({
          where: { id },
          data: { items: { create: snapshotItems } },
        });
      }

      return tx.challan.update({
        where: { id },
        data: {
          customerId: input.customerId ?? existing.customerId,
          totalQuantity,
        },
        include: { items: true, customer: true },
      });
    },
    { timeout: 15000 }
  );
}

export async function confirmChallan(id: string, createdById: string) {
  return prisma.$transaction(
    async (tx) => {
      const challan = await tx.challan.findUnique({ where: { id }, include: { items: true } });
      if (!challan) throw new AppError("Challan not found", 404);
      if (challan.status !== "DRAFT") {
        throw new AppError("Only draft challans can be confirmed", 409);
      }

      await reduceStockForItems(
        tx,
        challan.items.map((i) => ({ productId: i.productId!, quantity: i.quantity })),
        createdById
      );

      return tx.challan.update({
        where: { id },
        data: { status: "CONFIRMED" },
        include: { items: true, customer: true },
      });
    },
    { timeout: 15000 }
  );
}

export async function cancelChallan(id: string, createdById: string) {
  return prisma.$transaction(
    async (tx) => {
      const challan = await tx.challan.findUnique({ where: { id }, include: { items: true } });
      if (!challan) throw new AppError("Challan not found", 404);
      if (challan.status === "CANCELLED") {
        throw new AppError("Challan is already cancelled", 409);
      }

      if (challan.status === "CONFIRMED") {
        await restockForItems(
          tx,
          challan.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          createdById
        );
      }

      return tx.challan.update({
        where: { id },
        data: { status: "CANCELLED" },
        include: { items: true, customer: true },
      });
    },
    { timeout: 15000 }
  );
}
