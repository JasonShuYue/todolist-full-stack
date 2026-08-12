import type { Todo } from "../api/todos";
import { TodoItem } from "./TodoItem";

type TodoListProps = {
  todos: Todo[];
  busyTodoId: number | null;
  onToggleTodo: (todo: Todo) => void;
  onUpdateTodoTitle: (todo: Todo, nextTitle: string) => void;
  onDeleteTodo: (todoId: number) => void;
};

export function TodoList({
  todos,
  busyTodoId,
  onToggleTodo,
  onUpdateTodoTitle,
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
          onUpdateTitle={onUpdateTodoTitle}
          onDelete={onDeleteTodo}
        />
      ))}
    </ul>
  );
}
