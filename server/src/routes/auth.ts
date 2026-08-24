import { Router } from "express";
import { Prisma } from "@prisma/client";

import { badRequest, internalServerError, conflict } from "../lib/http.js";
import { logError } from "../lib/logger.js";
import { parseWithSchema } from "../lib/validation.js";
import { loginBodySchema, registerBodySchema } from "../schemas/auth.js";
import { loginUser, registerUser } from "../services/auth.js";

export const authRouter = Router();

authRouter.post("/register", async (request, response) => {
  const parseResult = parseWithSchema(registerBodySchema, request.body);

  if (!parseResult.success) {
    badRequest(response, "INVALID_BODY", "Invalid register body");
    return;
  }

  try {
    const user = await registerUser(parseResult.data);
    response.status(201).json(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      conflict(response, "CONFLICT", "Email already exists");
      return;
    }

    logError("Failed to register user", error);
    internalServerError(response);
  }
});

authRouter.post("/login", async (request, response) => {
  const parseResult = parseWithSchema(loginBodySchema, request.body);

  if (!parseResult.success) {
    badRequest(response, "INVALID_BODY", "Invalid login body");
    return;
  }

  try {
    const user = await loginUser(parseResult.data);

    if (!user) {
      badRequest(response, "INVALID_BODY", "Invalid email or password");
      return;
    }

    response.json(user);
  } catch (error) {
    logError("Failed to login user", error);
    internalServerError(response);
  }
});
