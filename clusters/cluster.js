// cluster.js
import cluster from "cluster";
import os from "os";
import process from "process";
import Logger from "../utils/logger.js";
import { startServer } from "../bin/www.js";
const logger = new Logger();

// Determine optimal number of workers (default to half CPUs for memory savings)
const numCPUs = Math.max(1, Math.floor(os.cpus().length / 1));
const WORKER_RESTART_LIMIT = 5;
const WORKER_RESTART_WINDOW_MS = 60000;

if (cluster.isPrimary) {
  logger.log(`[Master] Master process running. PID: ${process.pid}`);

  const workerRestartTimestamps = [];
  function forkWorker(instanceId) {
    const now = Date.now();
    workerRestartTimestamps.push(now);

    // Cleanup old restarts
    while (
      workerRestartTimestamps.length > 0 &&
      now - workerRestartTimestamps[0] > WORKER_RESTART_WINDOW_MS
    ) {
      workerRestartTimestamps.shift();
    }

    if (workerRestartTimestamps.length > WORKER_RESTART_LIMIT) {
      logger.error(
        `[Master] Too many worker restarts within time window. Exiting...`
      );
      process.exit(1);
    }

    cluster.fork({ NODE_APP_INSTANCE: instanceId.toString() });
  }

  // Fork initial workers
  for (let i = 0; i < numCPUs; i++) {
    forkWorker(i);
  }

  cluster.on("exit", (worker, code, signal) => {
    logger.warn(
      `[Master] Worker ${worker.process.pid} died. Code: ${code}, Signal: ${signal}`
    );
    forkWorker();
  });

  // Optional: Log active worker PIDs
  setInterval(() => {
    const activeWorkers = Object.values(cluster.workers).map(
      (w) => w.process.pid
    );
    logger.log(`[Master] Active workers: ${activeWorkers.join(", ")}`);
  }, 30000);
} else {
  startServer()
    .then(() => {
      logger.log(`[Worker] Worker ${process.pid} started server`);
    })
    .catch((err) => {
      logger.error(`[Worker] Failed to start server: ${err.message}`, err);
      process.exit(1);
    });
}
