import type { Dispatch, SetStateAction } from "react";

type TodoPaginationProps = {
  page: number;
  total: number;
  totalPages: number;
  onPageChange: Dispatch<SetStateAction<number>>;
};

export function TodoPagination({
  page,
  total,
  totalPages,
  onPageChange,
}: TodoPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="todo-pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange((currentPage) => currentPage - 1)}
      >
        Previous
      </button>

      <span>
        Page {page} of {totalPages} · {total} total
      </span>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange((currentPage) => currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}
