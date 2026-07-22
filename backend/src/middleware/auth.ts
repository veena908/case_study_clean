import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

export interface AuthPayload {
  userId: string;
  role: Role;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Authentication token missing", 401);
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
}

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      throw new AppError("You do not have permission to perform this action", 403);
    }
    next();
  };
}
