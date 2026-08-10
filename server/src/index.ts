import "dotenv/config"; // 用于环境变量
import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";

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
  const { completed } = request.body;

  if (!Number.isInteger(id) || id <= 0) {
    response.status(400).json({
      message: "Invalid todo id",
    });
    return;
  }

  if (typeof completed !== "boolean") {
    response.status(400).json({
      message: "Completed must be a boolean",
    });
    return;
  }

  const todo = await prisma.todo.update({
    where: {
      id,
    },
    data: {
      completed,
    },
  });

  response.json(todo);
});

app.delete("/todos/:id", async (requst, response) => {
  const id = Number(requst.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    response.status(400).json({
      message: "Invalid todo id",
    });
    return;
  }

  await prisma.todo.delete({
    where: {
      id,
    },
  });

  response.status(204).send();
});

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Server is running on port:${port}`);
});
