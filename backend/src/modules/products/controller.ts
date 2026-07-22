import { Request, Response } from "express";
import { getPagination, paginatedResponse } from "../../utils/pagination";
import * as productService from "./service";

export async function listHandler(req: Request, res: Response) {
  const { page, pageSize, skip, take } = getPagination(req);
  const { search, category, lowStock } = req.query as Record<string, string | undefined>;
  const { data, total } = await productService.listProducts({
    skip,
    take,
    search,
    category,
    lowStock: lowStock === "true",
  });
  res.json({ success: true, ...paginatedResponse(data, total, page, pageSize) });
}

export async function createHandler(req: Request, res: Response) {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ success: true, data: product });
}

export async function getByIdHandler(req: Request, res: Response) {
  const product = await productService.getProductById(req.params.id);
  res.json({ success: true, data: product });
}

export async function updateHandler(req: Request, res: Response) {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.json({ success: true, data: product });
}

export async function stockMovementHandler(req: Request, res: Response) {
  const result = await productService.recordStockMovement(req.params.id, req.body, req.user!.userId);
  res.status(201).json({ success: true, data: result });
}

export async function listMovementsHandler(req: Request, res: Response) {
  const movements = await productService.listStockMovements(req.params.id);
  res.json({ success: true, data: movements });
}
