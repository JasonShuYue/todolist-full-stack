export class TodoNotFoundError extends Error {
  constructor() {
    super("Todo not found");
    this.name = "TodoNotFoundError";
  }
}

export function isTodoNotFoundError(error: unknown) {
  return error instanceof TodoNotFoundError;
}
