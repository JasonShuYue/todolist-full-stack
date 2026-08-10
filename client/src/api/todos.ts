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

  if (!response.ok) {
    throw new Error("Failed to load todos");
  }

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

  if (!response.ok) {
    throw new Error("Failed to create todo");
  }

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

  if (!response.ok) {
    throw new Error("Failed to update todo");
  }

  return (await response.json()) as Todo;
}

export async function deleteTodo(todoId: number) {
  const response = await fetch(`/api/todos/${todoId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete todo");
  }
}
