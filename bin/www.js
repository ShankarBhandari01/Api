// bin/www.js
import { createServer } from "http";
import index from "../server/index.js";
import os from "os";
import container from "../containers/Containers.js";

const app = index.app;

export async function startServer() {
  const server = createServer(app);
  const { redisSocketService, logger } = container.cradle;

  redisSocketService.init(
    server,
    index.userSession,
    process.env.CORS_WHITELIST
  );

  function normalizePort(val) {
    const port = parseInt(val, 10);
    return isNaN(port) ? val : port >= 0 ? port : false;
  }

  const port = normalizePort(process.env.DEV_APP_PORT || "8080");
  app.set("port", port);

  server.listen(port);
  logger.log(
    `[App] Running in ${process.env.NODE_ENV || "development"} mode`,
    "info"
  );

  server.on("error", onError);
  server.on("listening", onListening);
  server.on("connection", onConnection);

  process.on("SIGINT", shutdownHandler("SIGINT"));
  process.on("SIGTERM", shutdownHandler("SIGTERM"));
  process.on("uncaughtException", errorHandler("Uncaught Exception"));
  process.on("unhandledRejection", errorHandler("Unhandled Promise Rejection"));

  function onError(error) {
    if (error.syscall !== "listen") throw error;
    const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;
    switch (error.code) {
      case "EACCES":
        logger.log(`${bind} requires elevated privileges`, "error");
        process.exit(1);
      case "EADDRINUSE":
        logger.log(`${bind} is already in use`, "error");
        process.exit(1);
      default:
        throw error;
    }
  }

  function onListening() {
    const addr = server.address();
    const interfaces = os.networkInterfaces();
    const iface = Object.values(interfaces)
      .flat()
      .find((i) => !i.internal && i.family === "IPv4");
    const ip = iface ? iface.address : "localhost";
    const bind =
      typeof addr === "string" ? `pipe ${addr}` : `http://${ip}:${addr.port}`;
    logger.log(`[App] Server started and listening on ${bind}`, "info");
  }

  function onConnection(sock) {
    logger.log(
      `[App] New connection established ${sock.remoteAddress}`,
      "info"
    );
  }

  function shutdownHandler(signal) {
    return () => {
      gracefulShutdown(signal);
      setTimeout(() => {
        logger.log("[App] Forced shutdown due to timeout", "error");
        process.exit(1);
      }, 30000);
    };
  }

  function errorHandler(type) {
    return async (err) => {
      logger.log(`[App] ${type}: ${err.message}`, "error");
      logger.log(err.stack, "error");
      await gracefulShutdown(type);
      setTimeout(() => process.exit(1), 30000);
    };
  }

  async function gracefulShutdown(signal) {
    logger.log(`[App] Received ${signal}. Shutting down gracefully...`, "info");
    try {
      const {
        notificationQueueService,
        redisClientManager,
        mongoConnectionManager,
      } = container.cradle;

      if (mongoConnectionManager?.shutdown) {
        await mongoConnectionManager.shutdown();
        logger.log("[App] MongoDB connections closed.", "info");
      }

      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      logger.log("[App] HTTP server closed", "info");

      if (redisSocketService?.shutdown) await redisSocketService.shutdown();
      if (notificationQueueService?.shutdown)
        await notificationQueueService.shutdown();
      if (redisClientManager?.disconnect) await redisClientManager.disconnect();

      logger.log("[App] All services shut down cleanly", "info");
      process.exit(0);
    } catch (err) {
      logger.log(`[App] Error during shutdown: ${err.message}`, "error");
      process.exit(1);
    }
  }
}
