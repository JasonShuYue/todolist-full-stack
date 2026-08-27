import type { Response } from "express";

import type { ErrorCode } from "./errors.js";

export function sendErrorResponse(
  response: Response,
  status: number,
  code: ErrorCode,
  message: string,
) {
  response.status(status).json({
    code,
    message,
  });
}

export function unauthorized(response: Response, message: string) {
  sendErrorResponse(response, 401, "UNAUTHORIZED", message);
}

export function badRequest(
  response: Response,
  code: ErrorCode,
  message: string,
) {
  sendErrorResponse(response, 400, code, message);
}

export function notFound(response: Response, code: ErrorCode, message: string) {
  sendErrorResponse(response, 404, code, message);
}

export function internalServerError(response: Response) {
  sendErrorResponse(
    response,
    500,
    "INTERNAL_SERVER_ERROR",
    "Internal server error",
  );
}

export function conflict(response: Response, code: ErrorCode, message: string) {
  sendErrorResponse(response, 409, code, message);
}
