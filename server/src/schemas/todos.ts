import { z } from "zod";

export const getTodosQuerySchema = z.object({
  status: z.enum(["all", "active", "completed"]).default("all"),
  search: z.string().optional().default(""),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export const createTodoBodySchema = z.object({
  title: z.string().trim().min(1),
});

export const updateTodoBodySchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    completed: z.boolean().optional(),
  })
  .refine((data) => data.title !== undefined || data.completed !== undefined, {
    message: "No fields to update",
  });

export const todoParamsSchema = z.object({
  id: z.coerce.number().int().min(1),
});
