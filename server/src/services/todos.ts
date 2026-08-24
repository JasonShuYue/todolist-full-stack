import type { z } from "zod";

import { prisma } from "../lib/prisma.js";
import {
  createTodoBodySchema,
  getTodosQuerySchema,
  updateTodoBodySchema,
} from "../schemas/todos.js";
import { TodoNotFoundError } from "../lib/errors.js";

type ListTodosInput = z.infer<typeof getTodosQuerySchema> & {
  userId: number;
};

type CreateTodoInput = z.infer<typeof createTodoBodySchema> & {
  userId: number;
};

type UpdateTodoInput = z.infer<typeof updateTodoBodySchema> & {
  id: number;
  userId: number;
};

type DeleteTodoInput = {
  id: number;
  userId: number;
};

export async function listTodos({
  userId,
  status,
  search,
  page,
  pageSize,
}: ListTodosInput) {
  const where = {
    userId,
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

  const totalPages = Math.ceil(total / pageSize);
  const currentPage = totalPages > 0 ? Math.min(page, totalPages) : page;
  const skip = (currentPage - 1) * pageSize;
  const take = pageSize;

  const todos = await prisma.todo.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take,
  });

  return {
    items: todos,
    total,
    page: currentPage,
    pageSize,
    totalPages,
  };
}

export async function createTodo({ title, userId }: CreateTodoInput) {
  return prisma.todo.create({
    data: {
      title,
      userId,
    },
  });
}

export async function updateTodo({
  id,
  userId,
  title,
  completed,
}: UpdateTodoInput) {
  const result = await prisma.todo.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(completed !== undefined ? { completed } : {}),
    },
  });

  if (result.count === 0) {
    throw new TodoNotFoundError();
  }

  // 因为 updateMany 返回的不是更新后的 todo，updateMany只返回更新了几条，所以这里再查一次
  return prisma.todo.findUniqueOrThrow({
    where: {
      id,
    },
  });
}

export async function deleteTodo({ id, userId }: DeleteTodoInput) {
  const result = await prisma.todo.deleteMany({
    where: {
      id,
      userId,
    },
  });

  if (result.count === 0) {
    throw new TodoNotFoundError();
  }
}
