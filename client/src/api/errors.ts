export class ApiError extends Error {
  code: string;
  requestId?: string;

  constructor(code: string, message: string, requestId?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.requestId = requestId;
  }
}

type ApiErrorBody = {
  code?: unknown;
  message?: unknown;
};

export async function assertOk(response: Response, fallbackMessage: string) {
  if (response.ok) {
    return;
  }

  const requestId = response.headers.get("X-Request-Id") ?? undefined;

  try {
    const errorBody = (await response.json()) as ApiErrorBody;
    const code =
      typeof errorBody.code === "string" ? errorBody.code : "UNKNOWN_ERROR";
    const message =
      typeof errorBody.message === "string"
        ? errorBody.message
        : fallbackMessage;

    throw new ApiError(code, message, requestId);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError("UNKNOWN_ERROR", fallbackMessage, requestId);
  }
}
