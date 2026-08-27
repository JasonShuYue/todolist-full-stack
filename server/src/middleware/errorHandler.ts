import type { NextFunction, Request, Response } from "express";

import { isHttpError } from "../lib/errors.js";
import { internalServerError, sendErrorResponse } from "../lib/http.js";
import { logError } from "../lib/logger.js";

export function errorHandler(
  error: unknown,
  request: Request,
  response: Response,
  next: NextFunction,
) {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (isHttpError(error)) {
    sendErrorResponse(response, error.status, error.code, error.message);
    return;
  }

  logError("Unhandled route error", error, {
    requestId: request.requestId,
  });
  internalServerError(response);
}
