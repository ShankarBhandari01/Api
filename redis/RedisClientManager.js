import { createClient } from "redis";

class RedisClientManager {
  constructor({ redisUrl, logger }) {
    this.redisUrl = redisUrl;
    this.pubClient = null;
    this.subClient = null;
    this.cacheClient = null;
    this.logger = logger;
  }

  async connect() {
    if (!this.redisUrl) {
      throw new Error("Redis URL is required");
    }

    this.pubClient = createClient({
      url: this.redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 5) return new Error("Too many retries");
          return 1000 * retries; // Exponential backoff
        },
      },
    });
    this.subClient = this.pubClient.duplicate();
    this.cacheClient = this.pubClient.duplicate();

    for (const client of [this.pubClient, this.subClient, this.cacheClient]) {
      client.on("error", (err) => {
        this.logger.log(
          `[RedisClientManager] Redis error: ${err.message}`,
          "error"
        );
      });

      client.on("end", () => {
        this.logger.log("[RedisClientManager] Redis connection ended", "warn");
      });

      client.on("reconnecting", () => {
        this.logger.log("[RedisClientManager] Redis reconnecting...", "warn");
      });
    }

    await Promise.all([
      this.pubClient.connect(),
      this.subClient.connect(),
      this.cacheClient.connect(),
    ]);
  }

  getClients() {
    if (!this.pubClient || !this.subClient || !this.cacheClient) {
      throw new Error(
        "[RedisClientManager] Redis clients are not connected yet. Call connect() first."
      );
    }

    return {
      pubClient: this.pubClient,
      subClient: this.subClient,
      cacheClient: this.cacheClient,
    };
  }

  async disconnect() {
    try {
      this.logger.log("[RedisClientManager] Disconnecting clients...", "info");
      await Promise.all([
        this.pubClient?.quit(),
        this.subClient?.quit(),
        this.cacheClient?.quit(),
      ]);
      this.logger.log(
        "[RedisClientManager] All Redis clients disconnected",
        "info"
      );
    } catch (err) {
      this.logger.log(
        `[RedisClientManager] Error during disconnect: ${err.message}`,
        "error"
      );
    }
  }
}

export default RedisClientManager;
