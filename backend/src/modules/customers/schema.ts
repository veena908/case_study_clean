import { z } from "zod";

export const customerTypeEnum = z.enum(["RETAIL", "WHOLESALE", "DISTRIBUTOR"]);
export const customerStatusEnum = z.enum(["LEAD", "ACTIVE", "INACTIVE"]);

export const createCustomerSchema = z.object({
  name: z.string().min(1),
  mobile: z.string().min(6),
  email: z.string().email(),
  businessName: z.string().min(1),
  gstNumber: z.string().optional(),
  customerType: customerTypeEnum,
  address: z.string().min(1),
  status: customerStatusEnum.optional().default("LEAD"),
  followUpDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const listCustomerQuerySchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  search: z.string().optional(),
  status: customerStatusEnum.optional(),
  customerType: customerTypeEnum.optional(),
});

export const addNoteSchema = z.object({
  note: z.string().min(1),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
