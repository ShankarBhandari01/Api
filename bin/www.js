#!/usr/bin/www.js

/**
 * Module dependencies.
 */
import { createServer } from "http";
import app from "../server/index.js";
import os from "os";
import container from "../containers/Containers.js";

const RedisSocketService = container.resolve("redisSocketService");
const logger = container.resolve("logger");

/**
 * Create HTTP server.
 */
const server = createServer(app);

/**
 * Create seckot redis server.
 */

RedisSocketService.init(server);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.DEV_APP_PORT || "8080");
app.set("port", port);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      logger.log(`${bind} requires elevated privileges`, "error");
      process.exit(1);
      break;
    case "EADDRINUSE":
      logger.log(`${bind} is already in use`, "error");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const networkInterfaces = os.networkInterfaces();
  const ipAddress = networkInterfaces["eth0"]
    ? networkInterfaces["eth0"][0].address
    : "localhost";

  const bind =
    typeof addr === "string"
      ? `pipe ${addr}`
      : `http://${ipAddress}:${addr.port}`;

  logger.log(`[App] Server started and listening on ${bind}`, "info");
}
/**
 * Event listener for HTTP server "connection" event.
 * This event is emitted when a new connection is made to the server.
 * It can be used to log connection details or perform other actions.
 */
function onConnection(sock) {
  logger.log(`[App] New connection established ${sock.remoteAddress}`, "info");
}

/**
 * Graceful shutdown handler
 */
function gracefulShutdown(signal) {
  logger.log(`[App] Received ${signal}. Shutting down gracefully...`, "info");

  // Close any active database connection
  const dbConnection = app.get("db");
  if (dbConnection && dbConnection.close) {
    dbConnection.close(() => {
      logger.log("[App] Database connection closed successfully.", "info");
    });
  }

  // Close the HTTP server
  server.close(() => {
    logger.log("[App] HTTP server closed successfully", "info");
    process.exit(0);
  });

  // Force shutdown if server does not close in time
  setTimeout(() => {
    logger.log("[App] Forced shutdown due to timeout", "error");
    process.exit(1);
  }, 30000); // 30 seconds timeout

  // shutdown redis sever
  SocketService.shutdown();
}

/**
 * Listen on provided port, on all network interfaces.
 */
logger.log(
  `[App] Running in ${process.env.NODE_ENV || "development"} mode`,
  "info"
);
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
server.on("connection", onConnection);

// Graceful shutdown on SIGINT and SIGTERM signals
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Handle uncaught exceptions (for debugging)
process.on("uncaughtException", (err) => {
  logger.log(`[App] Uncaught Exception: ${err.message}`, "error");
  logger.log(err.stack, "error");
  process.exit(1); // Exit with failure code
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.log(`[App] Unhandled Promise Rejection: ${err.message}`, "error");
  logger.log(err.stack, "error");
  process.exit(1); // Exit with failure code
});
