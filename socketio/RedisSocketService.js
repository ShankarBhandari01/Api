// socketio/RedisSocketService.js
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import registerNotificationGateway from "./notification.gateway.js";
import config from "../config/appconfig.js";

class SocketService {
  constructor({ logger }) {
    this.logger = logger;
  }
  io = null;
  pubClient = null;
  subClient = null;
  cacheClient = null;

  async init(server, options = {}) {
    this.io = new Server(server, {
      cors: {
        origin: options.corsOrigin || "*",
      },
    });
    var redisUrl;
    if (process.env.NODE_ENV == "test") {
      redisUrl = "redis://localhost:6380";
    } else {
      redisUrl =
        options.redisUrl || config.redis.host || "redis://localhost:6379";
    }

    // Redis for pub/sub and caching
    this.pubClient = createClient({ url: redisUrl });
    this.subClient = this.pubClient.duplicate();
    this.cacheClient = this.pubClient.duplicate();

    await Promise.all([
      this.pubClient.connect(),
      this.subClient.connect(),
      this.cacheClient.connect(),
    ]);

    this.io.adapter(createAdapter(this.pubClient, this.subClient));

    // Register event gateway
    registerNotificationGateway(this.io);

    this.logger.log(
      "[RedisSocketService] initialized with Redis Pub/Sub + Cache",
      "info"
    );
  }

  getIO() {
    if (!this.io) throw new Error("Socket.IO not initialized");
    return this.io;
  }

  getCache() {
    if (!this.cacheClient)
      throw new Error("Redis Cache client not initialized");
    return this.cacheClient;
  }

  async getCacheValue(key) {
    const value = await this.cacheClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  async setCacheValue(key, data, ttl = 60) {
    await this.cacheClient.setEx(key, ttl, JSON.stringify(data));
  }

  async delCacheKey(key) {
    await this.cacheClient.del(key);
  }

  async shutdown() {
    if (this.pubClient) await this.pubClient.quit();
    if (this.subClient) await this.subClient.quit();
    if (this.cacheClient) await this.cacheClient.quit();
    if (this.io) this.io.close();
  }
}

export default SocketService;
