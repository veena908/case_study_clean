import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { CreateCustomerInput, UpdateCustomerInput } from "./schema";

interface ListParams {
  skip: number;
  take: number;
  search?: string;
  status?: string;
  customerType?: string;
}

export async function listCustomers(params: ListParams) {
  const where: Prisma.CustomerWhereInput = {};
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { mobile: { contains: params.search } },
      { businessName: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params.status) where.status = params.status as never;
  if (params.customerType) where.customerType = params.customerType as never;

  const [data, total] = await Promise.all([
    prisma.customer.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: "desc" } }),
    prisma.customer.count({ where }),
  ]);

  return { data, total };
}

export async function createCustomer(input: CreateCustomerInput) {
  return prisma.customer.create({ data: input });
}

export async function getCustomerById(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { followUpNotes: { orderBy: { createdAt: "desc" }, include: { createdBy: { select: { name: true } } } } },
  });
  if (!customer) throw new AppError("Customer not found", 404);
  return customer;
}

export async function updateCustomer(id: string, input: UpdateCustomerInput) {
  await getCustomerById(id);
  return prisma.customer.update({ where: { id }, data: input });
}

export async function addFollowUpNote(customerId: string, note: string, createdById: string) {
  await getCustomerById(customerId);
  return prisma.followUpNote.create({
    data: { customerId, note, createdById },
  });
}

export async function listFollowUpNotes(customerId: string) {
  await getCustomerById(customerId);
  return prisma.followUpNote.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { name: true } } },
  });
}
