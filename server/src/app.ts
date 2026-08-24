import "dotenv/config"; // 用于环境变量
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { todosRouter } from "./routes/todos.js";
import { authRouter } from "./routes/auth.js";
import { requestLogger } from "./middleware/requestLogger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../client/dist");

export const app = express(); // 初始化实例

app.use(cors()); // 跨域中间件

app.use(requestLogger);

app.use(express.json()); // 解析 JSON 格式

app.use("/api/todos", todosRouter);

app.use("/api/auth", authRouter);

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    service: "todolist-server",
  });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientDistPath));

  app.use((_request, response) => {
    response.sendFile(path.join(clientDistPath, "index.html"));
  });
}
