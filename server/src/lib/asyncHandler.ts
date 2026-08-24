import type { NextFunction, Request, Response } from "express";

import { internalServerError } from "./http.js";
import { logError } from "./logger.js";

type AsyncRouteHandler = (
  request: Request,
  response: Response,
  next: NextFunction,
) => Promise<void>;

export function asyncHandler(
  handler: AsyncRouteHandler,
  message = "Unhandled route error",
) {
  return async function wrappedAsyncHandler(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    try {
      await handler(request, response, next);
    } catch (error) {
      logError(message, error, {
        requestId: request.requestId,
      });
      internalServerError(response);
    }
  };
}
