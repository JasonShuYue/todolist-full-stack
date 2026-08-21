import type { Response } from "express";

type ErrorCode =
  | "INVALID_QUERY"
  | "INVALID_BODY"
  | "INVALID_PARAMS"
  | "TODO_NOT_FOUND"
  | "INTERNAL_SERVER_ERROR"
  | "CONFLICT";

function errorResponse(
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

export function badRequest(
  response: Response,
  code: ErrorCode,
  message: string,
) {
  errorResponse(response, 400, code, message);
}

export function notFound(response: Response, code: ErrorCode, message: string) {
  errorResponse(response, 404, code, message);
}

export function internalServerError(response: Response) {
  errorResponse(
    response,
    500,
    "INTERNAL_SERVER_ERROR",
    "Internal server error",
  );
}

export function conflict(response: Response, code: ErrorCode, message: string) {
  errorResponse(response, 409, code, message)
}
