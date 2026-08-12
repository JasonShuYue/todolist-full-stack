import type { FormEvent } from "react";

type TodoFormProps = {
  title: string;
  isSubmitting: boolean;
  onTitleChange: (title: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function TodoForm({
  title,
  isSubmitting,
  onTitleChange,
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
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
