import "./App.css";
import { TodoForm } from "./components/TodoForm";
import { TodoList } from "./components/TodoList";
import { useTodos } from "./hooks/useTodos";

function App() {
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
  } = useTodos();

  return (
    <main className="app">
      <section className="todo-panel">
        <h1>Todos</h1>

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
