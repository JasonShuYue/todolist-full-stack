export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TodoFilter = "all" | "active" | "completed";

export type TodosPage = {
  items: Todo[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type ApiErrorBody = {
  code?: unknown;
  message?: unknown;
};

export class ApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

async function assertOk(response: Response, fallbackMessage: string) {
  if (response.ok) {
    return;
  }

  try {
    const errorBody = (await response.json()) as ApiErrorBody;
    const code =
      typeof errorBody.code === "string" ? errorBody.code : "UNKNOWN_ERROR";
    const message =
      typeof errorBody.message === "string"
        ? errorBody.message
        : fallbackMessage;

    throw new ApiError(code, message);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError("UNKNOWN_ERROR", fallbackMessage);
  }
}

export async function fetchTodos(
  status: TodoFilter,
  search: string,
  page: number,
  pageSize: number,
) {
  const searchParams = new URLSearchParams({
    status,
    page: String(page),
    pageSize: String(pageSize),
  });

  const trimmedSearch = search.trim();

  if (trimmedSearch.length > 0) {
    searchParams.set("search", trimmedSearch);
  }

  const response = await fetch(`/api/todos?${searchParams.toString()}`);

  await assertOk(response, "Failed to load todos");

  return (await response.json()) as TodosPage;
}

export async function createTodo(title: string) {
  const response = await fetch("/api/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
    }),
  });

  await assertOk(response, "Failed to create todo");

  return (await response.json()) as Todo;
}

export async function updateTodo(
  todoId: number,
  data: {
    title?: string;
    completed?: boolean;
  },
) {
  const response = await fetch(`/api/todos/${todoId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  await assertOk(response, "Failed to update todo");

  return (await response.json()) as Todo;
}

export async function deleteTodo(todoId: number) {
  const response = await fetch(`/api/todos/${todoId}`, {
    method: "DELETE",
  });

  await assertOk(response, "Failed to delete todo");
}
