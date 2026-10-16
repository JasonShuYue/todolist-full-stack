import type { Todo, TodoPriority } from "../api/todos";
import { TodoItem } from "./TodoItem";

type TodoListProps = {
  todos: Todo[];
  busyTodoId: number | null;
  onToggleTodo: (todo: Todo) => void;
  onUpdateTodoDetails: (todo: Todo, nextTitle: string, nextPriority: TodoPriority) => void;
  onDeleteTodo: (todoId: number) => void;
};

export function TodoList({
  todos,
  busyTodoId,
  onToggleTodo,
  onUpdateTodoDetails,
  onDeleteTodo,
}: TodoListProps) {
  if (todos.length === 0) {
    return <p className="muted">No todos yet.</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isBusy={busyTodoId === todo.id}
          onToggle={onToggleTodo}
          onUpdateDetails={onUpdateTodoDetails}
          onDelete={onDeleteTodo}
        />
      ))}
    </ul>
  );
}
