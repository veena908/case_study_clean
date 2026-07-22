import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../utils/AppError";

type Part = "body" | "query" | "params";

export function validate(schema: ZodSchema, part: Part = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      throw new AppError("Validation failed", 400, result.error.flatten().fieldErrors);
    }
    req[part] = result.data;
    next();
  };
}
