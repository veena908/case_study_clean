import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";
import { LoginInput } from "./schema";

export async function login({ email, password }: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn } as SignOptions
  );

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
