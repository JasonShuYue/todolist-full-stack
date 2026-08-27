import { Router } from "express";
import { Prisma } from "@prisma/client";

import { asyncHandler } from "../lib/asyncHandler.js";
import { badRequestError, conflictError } from "../lib/errors.js";
import { parseWithSchema } from "../lib/validation.js";
import { loginBodySchema, registerBodySchema } from "../schemas/auth.js";
import { loginUser, registerUser } from "../services/auth.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(async (request, response) => {
  const parseResult = parseWithSchema(registerBodySchema, request.body);

  if (!parseResult.success) {
    throw badRequestError("INVALID_BODY", "Invalid register body");
  }

  try {
    const user = await registerUser(parseResult.data);
    response.status(201).json(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw conflictError("CONFLICT", "Email already exists");
    }

    throw error;
  }
}));

authRouter.post("/login", asyncHandler(async (request, response) => {
  const parseResult = parseWithSchema(loginBodySchema, request.body);

  if (!parseResult.success) {
    throw badRequestError("INVALID_BODY", "Invalid login body");
  }

  const user = await loginUser(parseResult.data);

  if (!user) {
    throw badRequestError("INVALID_BODY", "Invalid email or password");
  }

  response.json(user);
}));
