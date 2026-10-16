import { assertOk } from "./errors";

export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  priority: TodoPriority;
};

export type TodoFilter = "all" | "active" | "completed";

export type TodoPriority = "low" | "normal" | "high";

export type TodosPage = {
  items: Todo[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const AUTH_TOKEN_KEY = "todo_auth_token";

export function getAuthToken() {
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

function createAuthHeaders(): Record<string, string> {
  const token = getAuthToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
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

  const response = await fetch(`/api/todos?${searchParams.toString()}`, {
    headers: createAuthHeaders(),
  });

  await assertOk(response, "Failed to load todos");

  return (await response.json()) as TodosPage;
}

export async function createTodo(title: string, priority: TodoPriority) {
  const response = await fetch("/api/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...createAuthHeaders(),
    },
    body: JSON.stringify({
      title,
      priority,
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
    priority?: TodoPriority;
  },
) {
  const response = await fetch(`/api/todos/${todoId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...createAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  await assertOk(response, "Failed to update todo");

  return (await response.json()) as Todo;
}

export async function deleteTodo(todoId: number) {
  const response = await fetch(`/api/todos/${todoId}`, {
    method: "DELETE",
    headers: createAuthHeaders(),
  });

  await assertOk(response, "Failed to delete todo");
}
