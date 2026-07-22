import { z } from "zod";

export const challanItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
});

export const createChallanSchema = z.object({
  customerId: z.string().min(1),
  items: z.array(challanItemInputSchema).min(1, "At least one product line is required"),
  status: z.enum(["DRAFT", "CONFIRMED"]).optional().default("DRAFT"),
});

export const updateChallanSchema = z.object({
  customerId: z.string().min(1).optional(),
  items: z.array(challanItemInputSchema).min(1).optional(),
});

export const listChallanQuerySchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  status: z.enum(["DRAFT", "CONFIRMED", "CANCELLED"]).optional(),
  customerId: z.string().optional(),
});

export type CreateChallanInput = z.infer<typeof createChallanSchema>;
export type UpdateChallanInput = z.infer<typeof updateChallanSchema>;
