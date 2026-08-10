import { useEffect, useState } from "react";
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

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<TodoFilter>(() => getInitialFilter());
  const [search, setSearch] = useState(() => getInitialSearch());
  const [debouncedSearch, setDebouncedSearch] = useState(() =>
    getInitialSearch(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadTodos(status: TodoFilter, searchTerm: string) {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchTodos(status, searchTerm);
      setTodos(data);
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
      await loadTodos(filter, debouncedSearch);
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
        await loadTodos(filter, debouncedSearch);
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
        await loadTodos(filter, debouncedSearch);
      }
      setErrorMessage("");
    } catch {
      setErrorMessage("Failed to update todo");
    }
  }

  async function handleDeleteTodo(todoId: number) {
    try {
      await deleteTodo(todoId);
      setTodos((currentTodos) =>
        currentTodos.filter((todo) => todo.id !== todoId),
      );
      setErrorMessage("");
    } catch {
      setErrorMessage("Failed to delete todo");
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [search]);

  useEffect(() => {
    void loadTodos(filter, debouncedSearch);
  }, [filter, debouncedSearch]);

  useEffect(() => {
    const searchParams = new URLSearchParams();
    const trimmedSearch = debouncedSearch.trim();

    if (filter !== "all") {
      searchParams.set("status", filter);
    }

    if (trimmedSearch.length > 0) {
      searchParams.set("search", trimmedSearch);
    }

    const queryString = searchParams.toString();
    const nextUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    window.history.replaceState(null, "", nextUrl);
  }, [filter, debouncedSearch]);

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
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            type="button"
            className={filter === "active" ? "active" : ""}
            onClick={() => setFilter("active")}
          >
            Active
          </button>
          <button
            type="button"
            className={filter === "completed" ? "active" : ""}
            onClick={() => setFilter("completed")}
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
      </section>
    </main>
  );
}

export default App;
