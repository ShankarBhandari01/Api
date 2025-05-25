// cluster.js
import cluster from "cluster";
import os from "os";
import process from "process";
import Logger from "../utils/logger.js";
import { startServer } from "../bin/www.js";

const logger = new Logger();

// Use half of CPUs to save memory (minimum 1)
const numCPUs =
  process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development"
    ? 1
    : Math.max(1, Math.floor(os.cpus().length / 1));

const WORKER_RESTART_LIMIT = 5;
const WORKER_RESTART_WINDOW_MS = 60000;

if (cluster.isPrimary) {
  logger.log(`[Master] Starting cluster with ${numCPUs} workers`, "info");
  logger.log(`[Master] Master process running. PID: ${process.pid}`);

  const workerRestartTimestamps = [];

  function forkWorker(instanceId) {
    const now = Date.now();
    workerRestartTimestamps.push(now);

    // Cleanup old timestamps
    while (
      workerRestartTimestamps.length > 0 &&
      now - workerRestartTimestamps[0] > WORKER_RESTART_WINDOW_MS
    ) {
      workerRestartTimestamps.shift();
    }

    if (workerRestartTimestamps.length > WORKER_RESTART_LIMIT) {
      logger.log(
        `[Master] Too many worker restarts within time window. Consider investigating issues.`,
        "error"
      );
      return; // Don't exit abruptly, just stop spawning
    }

    const worker = cluster.fork({ NODE_APP_INSTANCE: instanceId.toString() });

    // Handle worker-level error
    worker.on("error", (err) => {
      logger.log(
        `[Master] Worker ${worker.process.pid} error: ${err.message}`,
        "error"
      );
    });
  }

  // Initial worker fork
  for (let i = 0; i < numCPUs; i++) {
    forkWorker(i);
  }

  cluster.on("exit", (worker, code, signal) => {
    logger.log(
      `[Master] Worker ${worker.process.pid} died. Code: ${code}, Signal: ${signal}`,
      "warn"
    );
    forkWorker(); // Fork a new one (will be limited by logic above)
  });

  cluster.on("online", (worker) => {
    logger.log(`[Master] Worker ${worker.process.pid} is online`, "info");
  });

  cluster.on("disconnect", (worker) => {
    logger.log(`[Master] Worker ${worker.process.pid} disconnected`, "warn");
  });

  // Periodic status
  setInterval(() => {
    const activeWorkers = Object.values(cluster.workers).map(
      (w) => w.process.pid
    );
    logger.log(`[Master] Active workers: ${activeWorkers.join(", ")}`, "info");
  }, 50000);

  // Global error listener
  process.on("uncaughtException", (err) => {
    logger.log(`[Master] Uncaught Exception: ${err.message}`, "error");
  });

  process.on("unhandledRejection", (reason) => {
    logger.log(`[Master] Unhandled Rejection: ${reason}`, "error");
  });
} else {
  // Worker process
  process.on("uncaughtException", (err) => {
    logger.log(`[Worker] Uncaught Exception: ${err.message}`, "error");
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    logger.log(`[Worker] Unhandled Rejection: ${reason}`, "error");
    process.exit(1);
  });

  startServer()
    .then(() => {
      logger.log(`[Worker] Worker ${process.pid} started server`, "info");
    })
    .catch((err) => {
      logger.log(`[Worker] Failed to start server: ${err.message}`, "error");
      process.exit(1);
    });
}
