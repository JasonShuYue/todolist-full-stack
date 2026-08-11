import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";

const getTodosQuerySchema = z.object({
  status: z.enum(["all", "active", "completed"]).default("all"),
  search: z.string().optional().default(""),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

const createTodosBodySchema = z.object({
  title: z.string().trim().min(1),
});

const updateTodoBodySchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    completed: z.boolean().optional(),
  })
  .refine((data) => data.title !== undefined || data.completed !== undefined, {
    message: "No fields update",
  });

const todoParamsSchema = z.object({
  id: z.coerce.number().int().min(1),
});

function isRecordNotFoundError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

export const todosRouter = Router();

todosRouter.get("/", async (request, response) => {
  const parseResult = getTodosQuerySchema.safeParse(request.query);

  if (!parseResult.success) {
    response.status(400).json({
      message: "Invalid query",
    });
    return;
  }

  const {
    status,
    search,
    page: pageNumber,
    pageSize: pageSizeNumber,
  } = parseResult.data;

  const where = {
    ...(status === "active" ? { completed: false } : {}),
    ...(status === "completed" ? { completed: true } : {}),
    ...(search.length > 0
      ? {
          title: {
            contains: search,
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
  const parseResult = createTodosBodySchema.safeParse(request.body);

  if (!parseResult.success) {
    response.status(400).json({
      message: "Title is required",
    });
    return;
  }

  const { title } = parseResult.data;

  const todo = await prisma.todo.create({
    data: {
      title,
    },
  });

  response.status(201).json(todo);
});

todosRouter.patch("/:id", async (request, response) => {
  const parseParamsResult = todoParamsSchema.safeParse(request.params);

  if (!parseParamsResult.success) {
    response
      .status(400)
      .json({
        message: "Invalid todo id",
      })
      .json();
    return;
  }

  const { id } = parseParamsResult.data;

  if (!Number.isInteger(id) || id <= 0) {
    response.status(400).json({
      message: "Invalid todo id",
    });
    return;
  }

  const parseResult = updateTodoBodySchema.safeParse(request.body);

  if (!parseResult.success) {
    response.status(400).json({
      message: "Invalid todo update",
    });

    return;
  }

  const { title, completed } = parseResult.data;

  try {
    const todo = await prisma.todo.update({
      where: {
        id,
      },
      data: {
        ...(title !== undefined ? { title } : {}),
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
  const parseParamsResult = todoParamsSchema.safeParse(request.params);

  if (!parseParamsResult.success) {
    response
      .status(400)
      .json({
        message: "Invalid todo id",
      })
      .json();
    return;
  }

  const { id } = parseParamsResult.data;

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
