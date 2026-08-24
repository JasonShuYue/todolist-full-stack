import { app } from "./app.js";
import { logError, logInfo } from "./lib/logger.js";

const port = Number(process.env.PORT) || 3000;

const server = app.listen(port);

server.on("listening", () => {
  logInfo(`Server is running on port:${port}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    logError(`Port ${port} is already in use.`, error);
  } else {
    logError("Failed to start server", error);
  }

  process.exit(1);
});
