import type { z } from "zod";

import { prisma } from "../lib/prisma.js";
import {
  createTodoBodySchema,
  getTodosQuerySchema,
  updateTodoBodySchema,
} from "../schemas/todos.js";

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
  userId: _userId,
  title,
  completed,
}: UpdateTodoInput) {
  return prisma.todo.update({
    where: {
      id,
    },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(completed !== undefined ? { completed } : {}),
    },
  });
}

export async function deleteTodo({ id, userId: _userId }: DeleteTodoInput) {
  await prisma.todo.delete({
    where: {
      id,
    },
  });
}
