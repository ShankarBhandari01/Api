export default function registerNotificationGateway(io) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join", (userId) => {
      socket.join(`user:${userId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}

// Call this from anywhere
export function notifyUser(io, userId, message) {
  io.to(`user:${userId}`).emit("notification", { message });
}
