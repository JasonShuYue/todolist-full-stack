import { app } from "./app.js";

const port = Number(process.env.PORT) || 3000;

const server = app.listen(port);

server.on("listening", () => {
  console.log(`Server is running on port:${port}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use.`);
  } else {
    console.error("Failed to start server:", error);
  }

  process.exit(1);
});
