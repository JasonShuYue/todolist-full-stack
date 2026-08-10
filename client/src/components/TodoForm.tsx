import type { FormEvent } from "react";

type TodoFormProps = {
  title: string;
  onTitleChange: (title: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function TodoForm({ title, onTitleChange, onSubmit }: TodoFormProps) {
  return (
    <form className="todo-form" onSubmit={onSubmit}>
      <input
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="Add a todo"
      />
      <button type="submit">Add</button>
    </form>
  );
}
