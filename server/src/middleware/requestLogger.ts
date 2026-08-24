import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";

import { logError, logInfo, logWarn } from "../lib/logger.js";

export function requestLogger(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const start = Date.now();
  const requestId = crypto.randomUUID();

  request.requestId = requestId;
  response.setHeader("X-Request-Id", requestId);

  response.on("finish", () => {
    const duration = Date.now() - start;

    const message = `${request.method} ${request.originalUrl} ${response.statusCode} ${duration}ms requestId=${requestId}`;

    if (response.statusCode >= 500) {
      logError(message, { statusCode: response.statusCode });
      return;
    }

    if (response.statusCode >= 400) {
      logWarn(message);
      return;
    }

    logInfo(message);
  });

  next();
}
