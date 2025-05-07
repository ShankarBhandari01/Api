import Queue from "bull";
import SocketService from "../socketio/SocketService.js";
import { notifyUser } from "../socketio/notification.gateway.js";
import config from "../config/appconfig.js";

let notificationQueue;

export function initNotificationQueue() {
  notificationQueue = new Queue("notifications", config.redis.host, {
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

  notificationQueue.process(async (job) => {
    try {
      const { userId, message } = job.data;
      const io = SocketService.getIO();
      notifyUser(io, userId, message);
    } catch (err) {
      console.error(" Notification job failed:", err);
      throw err;
    }
  });

  // Graceful shutdown support
  const shutdown = async () => {
    console.log("🔁 Closing Bull notification queue...");
    await notificationQueue.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

// === Public API ===
export async function sendSocketioNotification(userId, message) {
  if (!notificationQueue) {
    throw new Error("Notification queue not initialized");
  }
  try {
    await notificationQueue.add({ userId, message });
    console.log(` Notification queued for user ${userId}`);
  } catch (err) {
    console.error(` Failed to queue notification: ${err.message}`);
  }
}
