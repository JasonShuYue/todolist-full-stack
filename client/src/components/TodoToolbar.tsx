import type { TodoFilter } from "../api/todos";

type TodoToolbarProps = {
  filter: TodoFilter;
  search: string;
  onFilterChange: (filter: TodoFilter) => void;
  onSearchChange: (search: string) => void;
};

export function TodoToolbar({
  filter,
  search,
  onFilterChange,
  onSearchChange,
}: TodoToolbarProps) {
  return (
    <>
      <div className="todo-filters">
        <button
          type="button"
          className={filter === "all" ? "active" : ""}
          onClick={() => onFilterChange("all")}
        >
          All
        </button>
        <button
          type="button"
          className={filter === "active" ? "active" : ""}
          onClick={() => onFilterChange("active")}
        >
          Active
        </button>
        <button
          type="button"
          className={filter === "completed" ? "active" : ""}
          onClick={() => onFilterChange("completed")}
        >
          Completed
        </button>
      </div>

      <div className="todo-search">
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search todos"
        />
        {search.trim().length > 0 && (
          <button type="button" onClick={() => onSearchChange("")}>
            Clear
          </button>
        )}
      </div>
    </>
  );
}
