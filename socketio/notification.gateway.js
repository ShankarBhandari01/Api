import Logger from "../utils/logger.js";
const logger = new Logger();

export default function registerNotificationGateway(io) {
  io.on("connection", (socket) => {
    logger.log(`[Socket.IO] User connected: ${socket.id}`, "info");

    // Session auth, if user is logged in
    const session = socket.handshake.session;
    if (session?.user?._id) {
      const userRoom = `user:${session.user._id}`;
      socket.join(userRoom);
      logger.log(
        `[Socket.IO] ${socket.id} joined user room ${userRoom}`,
        "info"
      );
    }

    // Add manual join for user room (for testing or non-session clients)
    socket.on("joinUserRoom", ({ userId }) => {
      if (!userId) {
        logger.log(`[Socket.IO] Missing userId from ${socket.id}`, "warn");
        return socket.emit("error", "Missing userId");
      }

      const userRoom = `user:${userId}`;
      socket.join(userRoom);
      logger.log(
        `[Socket.IO] ${socket.id} joined user room ${userRoom}`,
        "info"
      );
      socket.emit("joinedUserRoom", { userId });
    });
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
  const socketsInRoom = io.sockets.adapter.rooms.get(room);
  if (!socketsInRoom || socketsInRoom.size === 0) {
    logger.log(`[WARN] No sockets in room user:${userId}`,'warn');
  } else {
    const payload = typeof message === "string" ? { message } : message;
    io.to(room).emit("notification", payload);
    logger.log(
      `[Socket.IO] Notification sent to ${room}, ${JSON.stringify(payload)}`,
      "info"
    );
  }
}
// Helper to send notifications to order rooms
export function notifyOrder(io, orderId, message) {
  const room = `order:${orderId}`;
  io.to(room).emit("notification", { message });
  logger.log(`[Socket.IO] Notification sent to order room ${room}`, "info");
}
