import "dotenv/config"; // 用于环境变量
import express from "express";
import cors from "cors";
import { Prisma } from "@prisma/client";

import { prisma } from "./lib/prisma.js";

function isRecordNotFoundError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

const app = express(); // 初始化实例

app.use(cors()); // 跨域中间件

app.use(express.json()); // 解析 JSON 格式

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    service: "todolist-server",
  });
});

app.get("/todos", async (_request, response) => {
  const todos = await prisma.todo.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  response.json(todos);
});

app.post("/todos", async (request, response) => {
  const { title } = request.body;

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

app.patch("/todos/:id", async (request, response) => {
  const id = Number(request.params.id);
  const { title, completed } = request.body;

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

app.delete("/todos/:id", async (request, response) => {
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

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Server is running on port:${port}`);
});
