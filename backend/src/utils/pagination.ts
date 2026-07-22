import { Request } from "express";

export function getPagination(req: Request) {
  const page = Math.max(1, parseInt((req.query.page as string) ?? "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt((req.query.pageSize as string) ?? "20", 10) || 20));
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip, take: pageSize };
}

export function paginatedResponse<T>(data: T[], total: number, page: number, pageSize: number) {
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
  };
}
