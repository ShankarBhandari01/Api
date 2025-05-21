// socketio/RedisSocketService.js
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import sharedSession from "express-socket.io-session";
import registerNotificationGateway from "./notification.gateway.js";

class SocketService {
  constructor({ logger, redisClientManager }) {
    this.logger = logger;
    this.EVICTION_CHANNEL = "cache-eviction";
    this.redisClientManager = redisClientManager;
  }

  io = null;
  pubClient = null;
  subClient = null;
  cacheClient = null;

  async init(server, session, corsOrigin = "*") {
    this.io = new Server(server, {
      cors: {
        origin: corsOrigin,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.io.use(
      sharedSession(session, {
        autoSave: true,
      })
    );

    const { pubClient, subClient, cacheClient } =
      this.redisClientManager.getClients();

    // Redis for pub/sub and caching
    this.pubClient = pubClient;
    this.subClient = subClient;
    this.cacheClient = cacheClient;

    this.io.adapter(createAdapter(this.pubClient, this.subClient));

    // Register event gateway
    registerNotificationGateway(this.io);

    // Subscribe to eviction channel
    await this.subClient.subscribe(this.EVICTION_CHANNEL, async (message) => {
      try {
        const { key, pattern } = JSON.parse(message);
        if (key) {
          await this.cacheClient.unlink(key);
          this.logger.log(`[RedisSocketService] Evicted key: ${key}`, "info");
        } else if (pattern) {
          this.logger.log(
            `[RedisSocketService] Evicting keys by pattern: ${pattern}`,
            "info"
          );
          await this.delCacheKey(pattern, false); // false = don't republish again
        }
      } catch (err) {
        this.logger.log(
          `[RedisSocketService] Error handling eviction message: ${err}`,
          "error"
        );
      }
    });

    this.logger.log(
      "[RedisSocketService] initialized with Redis Pub/Sub + Cache",
      "info"
    );
  }

  getRedisClient = async () => {
    if (!this.pubClient) {
      this.logger.log(
        "[RedisSocketService] Redis client not initialized",
        "error"
      );
    }
    return this.pubClient;
  };

  getIO() {
    if (!this.io)
      this.logger.log(
        "[RedisSocketService] Socket.IO not initialized",
        "error"
      );
    return this.io;
  }

  getCache() {
    if (!this.cacheClient)
      throw this.logger.log(
        "[RedisSocketService] Redis Cache client not initialized",
        "error"
      );
    return this.cacheClient;
  }

  async getCacheValue(key) {
    const value = await this.cacheClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  async setCacheValue(key, data, ttl = 60) {
    await this.cacheClient.setEx(key, ttl, JSON.stringify(data));
  }

  // Add `broadcast = true` so we avoid re-publishing when this was already triggered via subscription
  async delCacheKey(pattern, broadcast = true) {
    try {
      let cursor = "0";
      let totalDeleted = 0;
      const MAX_BATCH = 100;
      let pipeline = this.cacheClient.multi();
      let batchSize = 0;

      do {
        const result = await this.cacheClient.scan(cursor, {
          MATCH: pattern,
          COUNT: 100,
        });

        const nextCursor = result.cursor;
        const keys = result.keys;

        if (keys.length) {
          keys.forEach((key) => pipeline.unlink(key));
          totalDeleted += keys.length;
          batchSize += keys.length;

          if (batchSize >= MAX_BATCH) {
            await pipeline
              .exec()
              .catch((err) =>
                this.logger.log(
                  `[RedisSocketService] Error unlinking batch keys: ${err}`,
                  "error"
                )
              );
            pipeline = this.cacheClient.multi();
            batchSize = 0;
          }
        }

        cursor = nextCursor;
      } while (cursor !== "0");

      if (batchSize > 0) {
        await pipeline
          .exec()
          .catch((err) =>
            this.logger.log(
              `[RedisSocketService] Error unlinking remaining keys: ${err}`,
              "error"
            )
          );
      }

      if (broadcast) {
        await this.pubClient.publish(
          this.EVICTION_CHANNEL,
          JSON.stringify({ pattern })
        );
      }

      this.logger.log(
        `[RedisSocketService] Unlinked ${totalDeleted} keys matching pattern: ${pattern}`,
        "info"
      );
    } catch (err) {
      this.logger.log(
        `[RedisSocketService] Unexpected error in delCacheKey: ${err}`,
        "error"
      );
    }
  }

  async delSingleCacheKey(key, broadcast = true) {
    try {
      await this.cacheClient.unlink(key);
      this.logger.log(`[RedisSocketService] Unlinked key: ${key}`, "info");
      if (broadcast) {
        await this.pubClient.publish(
          this.EVICTION_CHANNEL,
          JSON.stringify({ key })
        );
      }
    } catch (err) {
      this.logger.log(
        `[RedisSocketService] Failed to unlink key "${key}": ${err}`,
        "error"
      );
    }
  }

  async shutdown() {
    if (this.pubClient) await this.pubClient.quit();
    if (this.subClient) await this.subClient.quit();
    if (this.cacheClient) await this.cacheClient.quit();
    if (this.io) this.io.close();
  }
}

export default SocketService;
