import type { FormEvent } from "react";
import type { TodoPriority } from "../api/todos";

type TodoFormProps = {
  title: string;
  priority: TodoPriority;
  isSubmitting: boolean;
  onTitleChange: (title: string) => void;
  onPriorityChange: (priority: TodoPriority) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function TodoForm({
  title,
  priority,
  isSubmitting,
  onTitleChange,
  onPriorityChange,
  onSubmit,
}: TodoFormProps) {
  return (
    <form className="todo-form" onSubmit={onSubmit}>
      <input
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="Add a todo"
        disabled={isSubmitting}
      />
      <select
        aria-label="Priority"
        value={priority}
        onChange={(event) => onPriorityChange(event.target.value as TodoPriority)}
        disabled={isSubmitting}
      >
        <option value="low">Low</option>
        <option value="normal">Normal</option>
        <option value="high">High</option>
      </select>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
