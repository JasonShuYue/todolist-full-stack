export type ErrorCode =
  | "INVALID_QUERY"
  | "INVALID_BODY"
  | "INVALID_PARAMS"
  | "TODO_NOT_FOUND"
  | "INTERNAL_SERVER_ERROR"
  | "CONFLICT"
  | "UNAUTHORIZED";

export class HttpError extends Error {
  status: number;
  code: ErrorCode;

  constructor(status: number, code: ErrorCode, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}

export function badRequestError(code: ErrorCode, message: string) {
  return new HttpError(400, code, message);
}

export function conflictError(code: ErrorCode, message: string) {
  return new HttpError(409, code, message);
}

export function notFoundError(code: ErrorCode, message: string) {
  return new HttpError(404, code, message);
}

export function unauthorizedError(message: string) {
  return new HttpError(401, "UNAUTHORIZED", message);
}

export function isHttpError(error: unknown) {
  return error instanceof HttpError;
}

export class TodoNotFoundError extends Error {
  constructor() {
    super("Todo not found");
    this.name = "TodoNotFoundError";
  }
}

export function isTodoNotFoundError(error: unknown) {
  return error instanceof TodoNotFoundError;
}
