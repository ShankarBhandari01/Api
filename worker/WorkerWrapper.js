// worker/WorkerWrapper.js
import { Worker } from "worker_threads";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default class WorkerWrapper {
  constructor(workerFile, workerData, logger) {
    this.workerFile = workerFile;
    this.workerData = workerData;
    this.logger = logger;
    this.worker = null;
  }

  run() {
    return new Promise((resolve, reject) => {
      this.worker = new Worker(join(__dirname, this.workerFile), {
        workerData: this.workerData,
      });

      this.worker.on("message", (msg) => {
        if (msg?.error) {
          this.logger.log(
            `[WorkerWrapper] Worker error: ${msg.error}`,
            "error"
          );
        } else {
          this.logger.log(
            `[WorkerWrapper] Worker message: ${JSON.stringify(msg)}`,
            "info"
          );
          resolve(msg);
        }
      });

      this.worker.on("error", (err) => {
        this.logger.log(
          `[WorkerWrapper] Worker crashed: ${err.message}`,
          "error"
        );
      });

      this.worker.on("exit", (code) => {
        if (code !== 0) {
          const errorMsg = `[WorkerWrapper] Worker stopped with exit code ${code}`;
          this.logger.log(errorMsg, "error");
        }
      });
    });
  }
}
