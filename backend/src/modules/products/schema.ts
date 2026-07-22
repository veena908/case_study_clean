import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  unitPrice: z.coerce.number().nonnegative(),
  currentStock: z.coerce.number().int().nonnegative().optional().default(0),
  minStockAlert: z.coerce.number().int().nonnegative().optional().default(0),
  location: z.string().min(1),
});

export const updateProductSchema = createProductSchema.partial();

export const stockMovementSchema = z.object({
  quantityChanged: z.coerce.number().int().positive(),
  movementType: z.enum(["IN", "OUT"]),
  reason: z.string().min(1),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type StockMovementInput = z.infer<typeof stockMovementSchema>;
