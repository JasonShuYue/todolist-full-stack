import "dotenv/config"; // 用于环境变量
import express from "express";
import cors from "cors";

import { todosRouter } from "./routes/todos.js";

export const app = express(); // 初始化实例

app.use(cors()); // 跨域中间件

app.use(express.json()); // 解析 JSON 格式

app.use("/todos", todosRouter);

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    service: "todolist-server",
  });
});
