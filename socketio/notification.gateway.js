import Logger from "../utils/logger.js";
const logger = new Logger();

export default function registerNotificationGateway(io) {
  io.on("connection", (socket) => {
    logger.log(`[Socket.IO] User connected: ${socket.id}`, "info");

    // Session auth example, if user is logged in
    const session = socket.handshake.session;
    if (session?.user?._id) {
      const userRoom = `user:${session.user._id}`;
      socket.join(userRoom);
      logger.log(
        `[Socket.IO] ${socket.id} joined user room ${userRoom}`,
        "info"
      );
    }

    // For anonymous order tracking
    socket.on("joinOrderRoom", ({ orderId }) => {
      if (!orderId) {
        logger.log(
          `[Socket.IO] Missing orderId or token from ${socket.id}`,
          "warn"
        );
        return socket.emit("error", "Missing orderId or token");
      }

      const orderRoom = `order:${orderId}`;
      socket.join(orderRoom);
      logger.log(
        `[Socket.IO] ${socket.id} joined order room ${orderRoom}`,
        "info"
      );
      socket.emit("joinedOrderRoom", { orderId });
    });

    socket.on("disconnect", (reason) => {
      logger.log(
        `[Socket.IO] User disconnected: ${socket.id} (${reason})`,
        "info"
      );
    });
  });
}

// Call this from anywhere
export function notifyUser(io, userId, message) {
  if (!io || typeof io.to !== "function") {
    logger.log("[Socket.IO] Invalid IO instance", "error");
    return;
  }
  const room = `user:${userId}`;
  const payload = typeof message === "string" ? { message } : message;
  io.to(room).emit("notification", payload);
  logger.log(`[Socket.IO] Notification sent to ${room}, ${payload}`, "info");
}

// Helper to send notifications to order rooms
export function notifyOrder(io, orderId, message) {
  const room = `order:${orderId}`;
  io.to(room).emit("notification", { message });
  logger.log(`[Socket.IO] Notification sent to order room ${room}`, "info");
}

