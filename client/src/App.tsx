import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";
import {
  createTodo,
  deleteTodo,
  fetchTodos,
  updateTodo,
  type TodoFilter,
  type Todo,
} from "./api/todos";
import { TodoForm } from "./components/TodoForm";
import { TodoList } from "./components/TodoList";

function getInitialFilter(): TodoFilter {
  const status = new URLSearchParams(window.location.search).get("status");

  if (status === "active" || status === "completed") {
    return status;
  }

  return "all";
}

function getInitialSearch() {
  return new URLSearchParams(window.location.search).get("search") ?? "";
}

function getInitialPage() {
  const page = Number(new URLSearchParams(window.location.search).get("page"));

  if (Number.isInteger(page) && page > 0) {
    return page;
  }

  return 1;
}

function App() {
  const hasCompletedInitialSearchSync = useRef(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<TodoFilter>(() => getInitialFilter());
  const [search, setSearch] = useState(() => getInitialSearch());
  const [debouncedSearch, setDebouncedSearch] = useState(() =>
    getInitialSearch(),
  );
  const [page, setPage] = useState(() => getInitialPage());
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
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
    } catch {
      setErrorMessage("Failed to load todos");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0) {
      return;
    }

    try {
      await createTodo(trimmedTitle);
      await loadTodos(filter, debouncedSearch, 1);
      setTitle("");
      setErrorMessage("");
    } catch {
      setErrorMessage("Failed to create todo");
    }
  }

  async function handleToggleTodo(todo: Todo) {
    try {
      const updatedTodo = await updateTodo(todo.id, {
        completed: !todo.completed,
      });

      if (filter === "all" && debouncedSearch.trim().length === 0) {
        setTodos((currentTodos) =>
          currentTodos.map((currentTodo) =>
            currentTodo.id === updatedTodo.id ? updatedTodo : currentTodo,
          ),
        );
      } else {
        await loadTodos(filter, debouncedSearch, page);
      }
      setErrorMessage("");
    } catch {
      setErrorMessage("Failed to update todo");
    }
  }

  async function handleUpdateTodoTitle(todo: Todo, nextTitle: string) {
    const trimmedTitle = nextTitle.trim();

    if (trimmedTitle.length === 0 || trimmedTitle === todo.title) {
      return;
    }

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
    } catch {
      setErrorMessage("Failed to update todo");
    }
  }

  async function handleDeleteTodo(todoId: number) {
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
    } catch {
      setErrorMessage("Failed to delete todo");
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
    void loadTodos(filter, debouncedSearch, page);
  }, [filter, debouncedSearch, page]);

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

  return (
    <main className="app">
      <section className="todo-panel">
        <h1>Todos</h1>

        <TodoForm
          title={title}
          onTitleChange={setTitle}
          onSubmit={handleCreateTodo}
        />

        <div className="todo-filters">
          <button
            type="button"
            className={filter === "all" ? "active" : ""}
            onClick={() => {
              setPage(1);
              setFilter("all");
            }}
          >
            All
          </button>
          <button
            type="button"
            className={filter === "active" ? "active" : ""}
            onClick={() => {
              setPage(1);
              setFilter("active");
            }}
          >
            Active
          </button>
          <button
            type="button"
            className={filter === "completed" ? "active" : ""}
            onClick={() => {
              setPage(1);
              setFilter("completed");
            }}
          >
            Completed
          </button>
        </div>

        <div className="todo-search">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search todos"
          />
          {search.trim().length > 0 && (
            <button type="button" onClick={() => setSearch("")}>
              Clear
            </button>
          )}
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        {isLoading ? (
          <p className="muted">Loading...</p>
        ) : (
          <TodoList
            todos={todos}
            onToggleTodo={(todo) => void handleToggleTodo(todo)}
            onUpdateTodoTitle={(todo, nextTitle) =>
              void handleUpdateTodoTitle(todo, nextTitle)
            }
            onDeleteTodo={(todoId) => void handleDeleteTodo(todoId)}
          />
        )}

        {totalPages > 1 && (
          <div className="todo-pagination">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((currentPage) => currentPage - 1)}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages} · {total} total
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
