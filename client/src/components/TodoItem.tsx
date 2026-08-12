import { useState } from "react";
import type { FormEvent } from "react";
import type { Todo } from "../api/todos";

type TodoItemProps = {
  todo: Todo;
  isBusy: boolean;
  onToggle: (todo: Todo) => void;
  onUpdateTitle: (todo: Todo, nextTitle: string) => void;
  onDelete: (todoId: number) => void;
};

export function TodoItem({
  todo,
  isBusy,
  onToggle,
  onUpdateTitle,
  onDelete,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(todo.title);

  function handleStartEditing() {
    if (isBusy) {
      return;
    }

    setDraftTitle(todo.title);
    setIsEditing(true);
  }

  function handleCancelEditing() {
    setDraftTitle(todo.title);
    setIsEditing(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onUpdateTitle(todo, draftTitle);
    setIsEditing(false);
  }

  return (
    <li className="todo-item">
      {isEditing ? (
        <form className="todo-edit-form" onSubmit={handleSubmit}>
          <input
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            autoFocus
            disabled={isBusy}
          />
          <button type="submit" disabled={isBusy}>
            {isBusy ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={handleCancelEditing} disabled={isBusy}>
            Cancel
          </button>
        </form>
      ) : (
        <>
          <label className="todo-content">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => onToggle(todo)}
              disabled={isBusy}
            />
            <span
              className={todo.completed ? "todo-title completed" : "todo-title"}
            >
              {todo.title}
            </span>
          </label>

          <div className="todo-actions">
            <button type="button" onClick={handleStartEditing} disabled={isBusy}>
              Edit
            </button>
            <button
              className="delete-button"
              type="button"
              onClick={() => onDelete(todo.id)}
              disabled={isBusy}
            >
              {isBusy ? "Working..." : "Delete"}
            </button>
          </div>
        </>
      )}
    </li>
  );
}
