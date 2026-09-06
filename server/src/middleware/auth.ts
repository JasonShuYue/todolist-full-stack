import type { NextFunction, Request, Response } from "express";

import { unauthorizedError } from "../lib/errors.js";
import { verifyToken } from "../lib/jwt.js";

export function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const authorization = request.header("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw unauthorizedError("Unauthorized");
  }

  const token = authorization.slice("Bearer ".length);
  const payload = verifyToken(token);

  if (!payload) {
    throw unauthorizedError("Unauthorized");
  }

  request.userId = payload.userId;

  next();
}
