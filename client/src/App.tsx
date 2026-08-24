import "./App.css";
import { AuthForm } from "./components/AuthForm";
import { TodoForm } from "./components/TodoForm";
import { TodoList } from "./components/TodoList";
import { TodoPagination } from "./components/TodoPagination";
import { TodoToolbar } from "./components/TodoToolbar";
import { useAuth } from "./hooks/useAuth";
import { useTodos } from "./hooks/useTodos";

function App() {
  const {
    authError,
    authMode,
    currentUser,
    email,
    isAuthenticated,
    isLoggingIn,
    password,
    handleAuthSubmit,
    handleLogout,
    handleUnauthorized,
    setEmail,
    setPassword,
    toggleAuthMode,
  } = useAuth();

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
  } = useTodos({
    enabled: isAuthenticated,
    onUnauthorized: handleUnauthorized,
  });

  if (!isAuthenticated) {
    return (
      <main className="app">
        <section className="todo-panel">
          <h1>Todos</h1>

          <AuthForm
            authError={authError}
            authMode={authMode}
            email={email}
            isSubmitting={isLoggingIn}
            password={password}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={(event) => void handleAuthSubmit(event)}
            onToggleMode={toggleAuthMode}
          />
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <section className="todo-panel">
        <div className="todo-header">
          <h1>Todos</h1>
          <div className="auth-summary">
            {currentUser && <span>{currentUser.email}</span>}
            <button type="button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>

        <TodoForm
          title={title}
          isSubmitting={isCreating}
          onTitleChange={setTitle}
          onSubmit={handleCreateTodo}
        />

        <TodoToolbar
          filter={filter}
          search={search}
          onFilterChange={setFilter}
          onSearchChange={setSearch}
        />

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

        <TodoPagination
          page={page}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </section>
    </main>
  );
}

export default App;
