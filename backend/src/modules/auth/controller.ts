import { Request, Response } from "express";
import * as authService from "./service";

export async function loginHandler(req: Request, res: Response) {
  const result = await authService.login(req.body);
  res.json({ success: true, data: result });
}

export async function meHandler(req: Request, res: Response) {
  const result = await authService.getMe(req.user!.userId);
  res.json({ success: true, data: result });
}
