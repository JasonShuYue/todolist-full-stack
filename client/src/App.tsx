import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";
import {
  createTodo,
  deleteTodo,
  fetchTodos,
  updateTodo,
  type Todo,
} from "./api/todos";
import { TodoForm } from "./components/TodoForm";
import { TodoList } from "./components/TodoList";

type TodoFilter = "all" | "active" | "completed";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadTodos() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchTodos();
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
      const todo = await createTodo(trimmedTitle);
      setTodos((currentTodos) => [todo, ...currentTodos]);
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

      setTodos((currentTodos) =>
        currentTodos.map((currentTodo) =>
          currentTodo.id === updatedTodo.id ? updatedTodo : currentTodo,
        ),
      );
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

      setTodos((currentTodos) =>
        currentTodos.map((currentTodo) =>
          currentTodo.id === updatedTodo.id ? updatedTodo : currentTodo,
        ),
      );
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
    void loadTodos();
  }, []);

  const visibleTodos = todos.filter((todo) => {
    if (filter === "active") {
      return !todo.completed;
    }

    if (filter === "completed") {
      return todo.completed;
    }

    return true;
  });

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

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        {isLoading ? (
          <p className="muted">Loading...</p>
        ) : (
          <TodoList
            todos={visibleTodos}
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
