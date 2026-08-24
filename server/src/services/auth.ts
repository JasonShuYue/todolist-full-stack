import bcrypt from "bcryptjs";
import type { z } from "zod";

import { prisma } from "../lib/prisma.js";
import type { loginBodySchema, registerBodySchema } from "../schemas/auth.js";
import { signToken } from "../lib/jwt.js";

type RegisterInput = z.infer<typeof registerBodySchema>;
type LoginInput = z.infer<typeof loginBodySchema>;

export async function registerUser({ email, password }: RegisterInput) {
  const passwordHash = await bcrypt.hash(password, 10); // 10 是 salt

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

export async function loginUser({ email, password }: LoginInput) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return null;
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token: signToken(user.id),
  };
}
