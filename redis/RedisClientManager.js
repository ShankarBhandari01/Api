import { createClient } from "redis";

class RedisClientManager {
  constructor({ redisUrl,logger }) {
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

    this.pubClient = createClient({ url: this.redisUrl });
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
    await Promise.all([
      this.pubClient?.quit(),
      this.subClient?.quit(),
      this.cacheClient?.quit(),
    ]);
  }
}

export default RedisClientManager;
