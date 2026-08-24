import type { NextFunction, Request, Response } from "express";

import { unauthorized } from "../lib/http.js";
import { verifyToken } from "../lib/jwt.js";

export function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const authorization = request.header("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    unauthorized(response, "Unauthorized");
    return;
  }

  const token = authorization.slice("Bearer ".length);
  const payload = verifyToken(token);

  if (!payload) {
    unauthorized(response, "Unauthorized");
    return;
  }

  request.userId = payload.userId;

  next();
}
