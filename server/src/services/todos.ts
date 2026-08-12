import type { z } from "zod";

import { prisma } from "../lib/prisma.js";
import {
  createTodoBodySchema,
  getTodosQuerySchema,
  updateTodoBodySchema,
} from "../schemas/todos.js";

type ListTodosInput = z.infer<typeof getTodosQuerySchema>;

type CreateTodoInput = z.infer<typeof createTodoBodySchema>;

type UpdateTodoInput = z.infer<typeof updateTodoBodySchema> & {
  id: number;
};

export async function listTodos({
  status,
  search,
  page,
  pageSize,
}: ListTodosInput) {
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

export async function createTodo({ title }: CreateTodoInput) {
  return prisma.todo.create({
    data: {
      title,
    },
  });
}

export async function updateTodo({ id, title, completed }: UpdateTodoInput) {
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

export async function deleteTodo(id: number) {
  await prisma.todo.delete({
    where: {
      id,
    },
  });
}
