import { Prisma } from "@prisma/client";
import { Router } from "express";

import { prisma } from "../lib/prisma.js";

type CreateTodoBody = {
  title?: unknown;
};

type UpdateTodoBody = {
  title?: unknown;
  completed?: unknown;
};

type TodoStatusFilter = "all" | "active" | "completed";

type GetTodosQuery = {
  status?: unknown;
  search?: unknown;
  page?: unknown;
  pageSize?: unknown;
};

function isRecordNotFoundError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

export const todosRouter = Router();

todosRouter.get("/", async (request, response) => {
  const {
    status = "all",
    search,
    page = "1",
    pageSize = "10",
  } = request.query as GetTodosQuery;

  const searchTerm = typeof search === "string" ? search.trim() : "";
  const pageNumber = Number(page);
  const pageSizeNumber = Number(pageSize);

  if (status !== "all" && status !== "active" && status !== "completed") {
    response.status(400).json({
      message: "Invalid status filter",
    });
    return;
  }

  if (search !== undefined && typeof search !== "string") {
    response.status(400).json({
      message: "Invalid search query",
    });
    return;
  }

  if (typeof page !== "string" || typeof pageSize !== "string") {
    response.status(400).json({
      message: "Invalid pagination query",
    });
    return;
  }

  if (
    !Number.isInteger(pageNumber) ||
    pageNumber < 1 ||
    !Number.isInteger(pageSizeNumber) ||
    pageSizeNumber < 1 ||
    pageSizeNumber > 50
  ) {
    response.status(400).json({
      message: "Invalid pagination query",
    });
    return;
  }

  const where = {
    ...(status === "active" ? { completed: false } : {}),
    ...(status === "completed" ? { completed: true } : {}),
    ...(searchTerm.length > 0
      ? {
          title: {
            contains: searchTerm,
          },
        }
      : {}),
  };

  const total = await prisma.todo.count({
    where,
  });
  const totalPages = Math.ceil(total / pageSizeNumber);
  const currentPage =
    totalPages > 0 ? Math.min(pageNumber, totalPages) : pageNumber;
  const skip = (currentPage - 1) * pageSizeNumber;
  const take = pageSizeNumber;

  const todos = await prisma.todo.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take,
  });

  response.json({
    items: todos,
    total,
    page: currentPage,
    pageSize: pageSizeNumber,
    totalPages,
  });
});

todosRouter.post("/", async (request, response) => {
  const { title } = request.body as CreateTodoBody;

  if (typeof title !== "string" || title.trim().length === 0) {
    response.status(400).json({
      message: "Title is required",
    });
    return;
  }

  const todo = await prisma.todo.create({
    data: {
      title: title.trim(),
    },
  });

  response.status(201).json(todo);
});

todosRouter.patch("/:id", async (request, response) => {
  const id = Number(request.params.id);
  const { title, completed } = request.body as UpdateTodoBody;

  if (!Number.isInteger(id) || id <= 0) {
    response.status(400).json({
      message: "Invalid todo id",
    });
    return;
  }

  if (
    title !== undefined &&
    (typeof title !== "string" || title.trim().length === 0)
  ) {
    response.status(400).json({
      message: "Title must be a non-empty string",
    });
    return;
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    response.status(400).json({
      message: "Completed must be a boolean",
    });
    return;
  }

  if (title === undefined && completed === undefined) {
    response.status(400).json({
      message: "No fields to update",
    });
    return;
  }

  try {
    const todo = await prisma.todo.update({
      where: {
        id,
      },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(completed !== undefined ? { completed } : {}),
      },
    });

    response.json(todo);
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      response.status(404).json({
        message: "Todo not found",
      });
      return;
    }

    response.status(500).json({
      message: "Internal server error",
    });
  }
});

todosRouter.delete("/:id", async (request, response) => {
  const id = Number(request.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    response.status(400).json({
      message: "Invalid todo id",
    });
    return;
  }

  try {
    await prisma.todo.delete({
      where: {
        id,
      },
    });

    response.status(204).send();
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      response.status(404).json({
        message: "Todo not found",
      });
      return;
    }

    response.status(500).json({
      message: "Internal server error",
    });
  }
});
