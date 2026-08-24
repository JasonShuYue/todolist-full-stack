import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  ApiError,
  createTodo,
  deleteTodo,
  fetchTodos,
  updateTodo,
  type Todo,
  type TodoFilter,
} from "../api/todos";

export function getInitialFilter(): TodoFilter {
  const status = new URLSearchParams(window.location.search).get("status");

  if (status === "active" || status === "completed") {
    return status;
  }

  return "all";
}

export function getInitialSearch() {
  return new URLSearchParams(window.location.search).get("search") ?? "";
}

export function getInitialPage() {
  const page = Number(new URLSearchParams(window.location.search).get("page"));

  if (Number.isInteger(page) && page > 0) {
    return page;
  }

  return 1;
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return fallbackMessage;
}

export function useTodos({ enabled = true }: { enabled?: boolean } = {}) {
  const hasCompletedInitialSearchSync = useRef(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [filter, setFilterState] = useState<TodoFilter>(() =>
    getInitialFilter(),
  );
  const [search, setSearch] = useState(() => getInitialSearch());
  const [debouncedSearch, setDebouncedSearch] = useState(() =>
    getInitialSearch(),
  );
  const [page, setPage] = useState(() => getInitialPage());
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [busyTodoId, setBusyTodoId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadTodos(
    status: TodoFilter,
    searchTerm: string,
    nextPage: number,
  ) {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchTodos(status, searchTerm, nextPage, pageSize);
      setTodos(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to load todos"));
    } finally {
      setIsLoading(false);
    }
  }

  function setFilter(nextFilter: TodoFilter) {
    setPage(1);
    setFilterState(nextFilter);
  }

  async function handleCreateTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0 || isCreating) {
      return;
    }

    setIsCreating(true);

    try {
      await createTodo(trimmedTitle);
      await loadTodos(filter, debouncedSearch, 1);
      setTitle("");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to create todo"));
    } finally {
      setIsCreating(false);
    }
  }

  async function handleToggleTodo(todo: Todo) {
    if (busyTodoId !== null) {
      return;
    }

    function shouldKeepTodo(nextTodo: Todo) {
      if (filter === "active") {
        return !nextTodo.completed;
      }

      if (filter === "completed") {
        return nextTodo.completed;
      }

      return true;
    }

    setBusyTodoId(todo.id);

    const optimisticTodo = {
      ...todo,
      completed: !todo.completed,
    };

    setTodos((currentTodos) =>
      currentTodos
        .map((currentTodo) =>
          currentTodo.id === todo.id ? optimisticTodo : currentTodo,
        )
        .filter(shouldKeepTodo),
    );

    try {
      const updatedTodo = await updateTodo(todo.id, {
        completed: optimisticTodo.completed,
      });

      if (debouncedSearch.trim().length > 0) {
        await loadTodos(filter, debouncedSearch, page);
      } else {
        setTodos((currentTodos) =>
          currentTodos
            .map((currentTodo) =>
              currentTodo.id === updatedTodo.id ? updatedTodo : currentTodo,
            )
            .filter(shouldKeepTodo),
        );
      }

      setErrorMessage("");
    } catch (error) {
      await loadTodos(filter, debouncedSearch, page);
      setErrorMessage(getErrorMessage(error, "Failed to update todo"));
    } finally {
      setBusyTodoId(null);
    }
  }

  async function handleUpdateTodoTitle(todo: Todo, nextTitle: string) {
    const trimmedTitle = nextTitle.trim();

    if (
      trimmedTitle.length === 0 ||
      trimmedTitle === todo.title ||
      busyTodoId !== null
    ) {
      return;
    }

    setBusyTodoId(todo.id);

    try {
      const updatedTodo = await updateTodo(todo.id, {
        title: trimmedTitle,
      });

      if (debouncedSearch.trim().length === 0) {
        setTodos((currentTodos) =>
          currentTodos.map((currentTodo) =>
            currentTodo.id === updatedTodo.id ? updatedTodo : currentTodo,
          ),
        );
      } else {
        await loadTodos(filter, debouncedSearch, page);
      }
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to update todo"));
    } finally {
      setBusyTodoId(null);
    }
  }

  async function handleDeleteTodo(todoId: number) {
    if (busyTodoId !== null) {
      return;
    }

    setBusyTodoId(todoId);

    try {
      await deleteTodo(todoId);

      const nextTodos = todos.filter((todo) => todo.id !== todoId);
      const nextTotal = Math.max(total - 1, 0);
      const nextTotalPages = Math.ceil(nextTotal / pageSize);
      const nextPage =
        nextTodos.length === 0 && page > 1 ? Math.max(page - 1, 1) : page;

      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        setTodos(nextTodos);
        setTotal(nextTotal);
        setTotalPages(nextTotalPages);
      }

      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to delete todo"));
    } finally {
      setBusyTodoId(null);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (hasCompletedInitialSearchSync.current) {
        setPage(1);
      } else {
        hasCompletedInitialSearchSync.current = true;
      }

      setDebouncedSearch(search);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [search]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    void loadTodos(filter, debouncedSearch, page);
  }, [enabled, filter, debouncedSearch, page]);

  useEffect(() => {
    const searchParams = new URLSearchParams();
    const trimmedSearch = debouncedSearch.trim();

    if (filter !== "all") {
      searchParams.set("status", filter);
    }

    if (trimmedSearch.length > 0) {
      searchParams.set("search", trimmedSearch);
    }

    if (page > 1) {
      searchParams.set("page", String(page));
    }

    const queryString = searchParams.toString();
    const nextUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    window.history.replaceState(null, "", nextUrl);
  }, [filter, debouncedSearch, page]);

  return {
    todos,
    title,
    filter,
    search,
    page,
    total,
    totalPages,
    isLoading,
    isCreating,
    busyTodoId,
    errorMessage,
    setTitle,
    setFilter,
    setSearch,
    setPage,
    handleCreateTodo,
    handleToggleTodo,
    handleUpdateTodoTitle,
    handleDeleteTodo,
  };
}
