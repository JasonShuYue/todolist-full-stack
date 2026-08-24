import { useState } from "react";
import type { FormEvent } from "react";

import "./App.css";
import { login, register } from "./api/auth";
import { clearAuthToken, getAuthToken } from "./api/todos";
import { TodoForm } from "./components/TodoForm";
import { TodoList } from "./components/TodoList";
import { useTodos } from "./hooks/useTodos";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => getAuthToken() !== null,
  );
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const {
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
  } = useTodos({ enabled: isAuthenticated });

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoggingIn) {
      return;
    }

    setIsLoggingIn(true);
    setAuthError("");

    try {
      if (authMode === "register") {
        await register(email, password);
      }

      await login(email, password);
      setIsAuthenticated(true);
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Authentication failed",
      );
    } finally {
      setIsLoggingIn(false);
    }
  }

  function handleLogout() {
    clearAuthToken();
    setIsAuthenticated(false);
  }

  if (!isAuthenticated) {
    return (
      <main className="app">
        <section className="todo-panel">
          <h1>Todos</h1>

          <form
            className="auth-form"
            onSubmit={(event) => void handleAuthSubmit(event)}
          >
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              disabled={isLoggingIn}
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              disabled={isLoggingIn}
            />
            <button type="submit" disabled={isLoggingIn}>
              {isLoggingIn
                ? authMode === "login"
                  ? "Logging in..."
                  : "Creating account..."
                : authMode === "login"
                  ? "Log in"
                  : "Create account"}
            </button>
          </form>

          <button
            type="button"
            className="auth-mode-button"
            onClick={() => {
              setAuthError("");
              setAuthMode((currentMode) =>
                currentMode === "login" ? "register" : "login",
              );
            }}
          >
            {authMode === "login"
              ? "Create a new account"
              : "Log in with an existing account"}
          </button>

          {authError && <p className="error-message">{authError}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <section className="todo-panel">
        <div className="todo-header">
          <h1>Todos</h1>
          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>

        <TodoForm
          title={title}
          isSubmitting={isCreating}
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
            busyTodoId={busyTodoId}
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
