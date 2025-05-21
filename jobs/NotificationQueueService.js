import Queue from "bull";
import { notifyUser, notifyOrder } from "../socketio/notification.gateway.js";

class NotificationQueueService {
  constructor({ redisSocketService, logger, redisUrl }) {
    this.redisSocketService = redisSocketService;
    this.logger = logger;
    this.redisUrl = redisUrl;
    this.queue = null;
  }

  async init() {
    this.queue = new Queue("notifications", {
      redis: this.redisUrl,
      settings: {
        maxStalledCount: 1,
        lockDuration: 60000,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });

    this.queue.process(this.processJob.bind(this));
    this._setupShutdownHooks();

    this.logger.log(
      "[NotificationQueueService] NotificationQueue initialized",
      "info"
    );

    this.trackjob();
  }
  trackjob() {
    this.queue.on("error", (err) => {
      this.logger.log(
        `[NotificationQueueService] Bull Queue Error: ${err.message}`,
        "error"
      );
    });

    this.queue.on("waiting", (jobId) => {
      this.logger.log(
        `[NotificationQueueService] Job waiting: ${jobId}`,
        "debug"
      );
    });

    this.queue.on("active", (job) => {
      this.logger.log(
        `[NotificationQueueService] Job active: ${job.id}`,
        "debug"
      );
    });

    this.queue.on("completed", (job) => {
      this.logger.log(
        `[NotificationQueueService] Job completed: ${job.id}`,
        "info"
      );
    });

    this.queue.on("failed", (job, err) => {
      this.logger.log(
        `[NotificationQueueService] Job failed: ${job.id}, Reason: ${err.message}`,
        "error"
      );
    });
  }
  async processJob(job) {
    try {
      const { userId, message, type } = job.data;
      const io = this.redisSocketService.getIO();

      if (type === "orderStatusUpdate") {
        notifyOrder(io, userId, message);
      } else {
        notifyUser(io, userId, message);
      }

      this.logger.log(
        `[NotificationQueueService] Notification sent to user ${userId}`,
        "info"
      );
    } catch (err) {
      this.logger.log(
        `[NotificationQueueService] Notification job failed: ${err.message}`,
        "error"
      );
    }
  }

  async send(userId, message, type) {
    if (!this.queue) {
      this.logger.log(
        "[NotificationQueueService] Notification queue not initialized",
        "error"
      );
      return;
    }

    try {
      await this.queue.add({ userId, message, type });
      this.logger.log(
        `[NotificationQueueService] Notification queued for user ${userId}`,
        "info"
      );
    } catch (err) {
      this.logger.log(
        `[NotificationQueueService] Failed to queue notification: ${err.message}`,
        "error"
      );
    }
  }

  async shutdown() {
    if (this.queue) {
      this.logger.log("Closing Bull notification queue...", "info");
      await this.queue.close();
    }
    process.exit(0);
  }

  _setupShutdownHooks() {
    process.once("SIGINT", () => this.shutdown());
    process.once("SIGTERM", () => this.shutdown());
  }
}

export default NotificationQueueService;
