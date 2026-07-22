import { Request, Response } from "express";
import { getPagination, paginatedResponse } from "../../utils/pagination";
import * as customerService from "./service";

export async function listHandler(req: Request, res: Response) {
  const { page, pageSize, skip, take } = getPagination(req);
  const { search, status, customerType } = req.query as Record<string, string | undefined>;
  const { data, total } = await customerService.listCustomers({ skip, take, search, status, customerType });
  res.json({ success: true, ...paginatedResponse(data, total, page, pageSize) });
}

export async function createHandler(req: Request, res: Response) {
  const customer = await customerService.createCustomer(req.body);
  res.status(201).json({ success: true, data: customer });
}

export async function getByIdHandler(req: Request, res: Response) {
  const customer = await customerService.getCustomerById(req.params.id);
  res.json({ success: true, data: customer });
}

export async function updateHandler(req: Request, res: Response) {
  const customer = await customerService.updateCustomer(req.params.id, req.body);
  res.json({ success: true, data: customer });
}

export async function addNoteHandler(req: Request, res: Response) {
  const note = await customerService.addFollowUpNote(req.params.id, req.body.note, req.user!.userId);
  res.status(201).json({ success: true, data: note });
}

export async function listNotesHandler(req: Request, res: Response) {
  const notes = await customerService.listFollowUpNotes(req.params.id);
  res.json({ success: true, data: notes });
}
