import { Request, Response } from "express";
import { getPagination, paginatedResponse } from "../../utils/pagination";
import * as challanService from "./service";

export async function listHandler(req: Request, res: Response) {
  const { page, pageSize, skip, take } = getPagination(req);
  const { status, customerId } = req.query as Record<string, string | undefined>;
  const { data, total } = await challanService.listChallans({ skip, take, status, customerId });
  res.json({ success: true, ...paginatedResponse(data, total, page, pageSize) });
}

export async function createHandler(req: Request, res: Response) {
  const challan = await challanService.createChallan(req.body, req.user!.userId);
  res.status(201).json({ success: true, data: challan });
}

export async function getByIdHandler(req: Request, res: Response) {
  const challan = await challanService.getChallanById(req.params.id);
  res.json({ success: true, data: challan });
}

export async function updateHandler(req: Request, res: Response) {
  const challan = await challanService.updateChallan(req.params.id, req.body);
  res.json({ success: true, data: challan });
}

export async function confirmHandler(req: Request, res: Response) {
  const challan = await challanService.confirmChallan(req.params.id, req.user!.userId);
  res.json({ success: true, data: challan });
}

export async function cancelHandler(req: Request, res: Response) {
  const challan = await challanService.cancelChallan(req.params.id, req.user!.userId);
  res.json({ success: true, data: challan });
}
