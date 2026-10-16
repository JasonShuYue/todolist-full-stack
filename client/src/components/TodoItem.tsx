import { useState } from "react";
import type { FormEvent } from "react";
import type { Todo, TodoPriority } from "../api/todos";

type TodoItemProps = {
  todo: Todo;
  isBusy: boolean;
  onToggle: (todo: Todo) => void;
  onUpdateDetails: (todo: Todo, nextTitle: string, nextPriority: TodoPriority) => void;
  onDelete: (todoId: number) => void;
};

export function TodoItem({
  todo,
  isBusy,
  onToggle,
  onUpdateDetails,
  onDelete,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(todo.title);
  const [draftPriority, setDraftPriority] = useState<TodoPriority>(todo.priority);

  function handleStartEditing() {
    if (isBusy) {
      return;
    }

    setDraftTitle(todo.title);
    setDraftPriority(todo.priority);
    setIsEditing(true);
  }

  function handleCancelEditing() {
    setDraftTitle(todo.title);
    setDraftPriority(todo.priority);
    setIsEditing(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onUpdateDetails(todo, draftTitle, draftPriority);
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
          <select
            aria-label="Priority"
            value={draftPriority}
            onChange={(event) => setDraftPriority(event.target.value as TodoPriority)}
            disabled={isBusy}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
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

          <span className={`todo-priority todo-priority-${todo.priority}`}>
            {todo.priority}
          </span>

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
