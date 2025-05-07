// socketio/SocketService.js
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import registerNotificationGateway from "./notification.gateway.js";
import config from "../config/appconfig.js";

class SocketService {
  io = null;
  pubClient = null;
  subClient = null;

  async init(server, options = {}) {
    this.io = new Server(server, {
      cors: {
        origin: options.corsOrigin || "*",
      },
    });

    this.pubClient = createClient({
      url: options.redisUrl || config.redis.host || "redis://localhost:6379",
    });
    this.subClient = this.pubClient.duplicate();

    await this.pubClient.connect();
    await this.subClient.connect();

    this.io.adapter(createAdapter(this.pubClient, this.subClient));

    registerNotificationGateway(this.io);
  }

  getIO() {
    if (!this.io) {
      throw new Error("Socket.IO not initialized");
    }
    return this.io;
  }

  // Close Redis and IO on shutdown
  async shutdown() {
    if (this.pubClient) await this.pubClient.quit();
    if (this.subClient) await this.subClient.quit();
    if (this.io) this.io.close();
  }
}

export default new SocketService();
