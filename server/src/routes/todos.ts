import { Router } from "express";

import { isTodoNotFoundError } from "../lib/errors.js";
import { badRequest, internalServerError, notFound } from "../lib/http.js";
import { isRecordNotFoundError } from "../lib/prisma.js";
import { parseWithSchema } from "../lib/validation.js";
import { requireAuth } from "../middleware/auth.js";
import {
  createTodoBodySchema,
  getTodosQuerySchema,
  todoParamsSchema,
  updateTodoBodySchema,
} from "../schemas/todos.js";
import {
  createTodo,
  deleteTodo,
  listTodos,
  updateTodo,
} from "../services/todos.js";

export const todosRouter = Router();

todosRouter.use(requireAuth);

function getAuthenticatedUserId(request: { userId?: number }) {
  if (request.userId === undefined) {
    throw new Error("Authenticated request is missing userId");
  }

  return request.userId;
}

todosRouter.get("/", async (request, response) => {
  const parseResult = parseWithSchema(getTodosQuerySchema, request.query);
  const userId = getAuthenticatedUserId(request);

  if (!parseResult.success) {
    badRequest(response, "INVALID_QUERY", "Invalid query");
    return;
  }

  const {
    status,
    search,
    page: pageNumber,
    pageSize: pageSizeNumber,
  } = parseResult.data;

  const result = await listTodos({
    userId,
    status,
    search,
    page: pageNumber,
    pageSize: pageSizeNumber,
  });

  response.json(result);
});

todosRouter.post("/", async (request, response) => {
  const parseResult = parseWithSchema(createTodoBodySchema, request.body);
  const userId = getAuthenticatedUserId(request);

  if (!parseResult.success) {
    badRequest(response, "INVALID_BODY", "Title is required");
    return;
  }

  const { title } = parseResult.data;

  const todo = await createTodo({
    title,
    userId,
  });

  response.status(201).json(todo);
});

todosRouter.patch("/:id", async (request, response) => {
  const parseParamsResult = parseWithSchema(todoParamsSchema, request.params);
  const userId = getAuthenticatedUserId(request);

  if (!parseParamsResult.success) {
    badRequest(response, "INVALID_PARAMS", "Invalid todo id");
    return;
  }

  const { id } = parseParamsResult.data;

  const parseResult = parseWithSchema(updateTodoBodySchema, request.body);

  if (!parseResult.success) {
    badRequest(response, "INVALID_BODY", "Invalid todo update");

    return;
  }

  const { title, completed } = parseResult.data;

  try {
    const todo = await updateTodo({
      id,
      userId,
      title,
      completed,
    });

    response.json(todo);
  } catch (error) {
    if (isRecordNotFoundError(error) || isTodoNotFoundError(error)) {
      notFound(response, "TODO_NOT_FOUND", "Todo not found");
      return;
    }

    internalServerError(response);
  }
});

todosRouter.delete("/:id", async (request, response) => {
  const parseParamsResult = parseWithSchema(todoParamsSchema, request.params);
  const userId = getAuthenticatedUserId(request);

  if (!parseParamsResult.success) {
    badRequest(response, "INVALID_PARAMS", "Invalid todo id");
    return;
  }

  const { id } = parseParamsResult.data;

  try {
    await deleteTodo({
      id,
      userId,
    });

    response.status(204).send();
  } catch (error) {
    if (isRecordNotFoundError(error) || isTodoNotFoundError(error)) {
      notFound(response, "TODO_NOT_FOUND", "Todo not found");
      return;
    }

    internalServerError(response);
  }
});
