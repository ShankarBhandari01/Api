import { createConnection } from "mongoose";
import { readFileSync } from "fs";
import logger from "../utils/logger.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MongoConnectionManager extends logger {
  constructor() {
    super();
    this.connections = {};
    this.connectionString = null;
    this.pendingConnections = {};
    this.env = process.env.NODE_ENV || "development";

    const configPath = join(__dirname, "..", "config", "config.json");
    this.config = JSON.parse(readFileSync(configPath))[this.env];

    this._defaultOptions = {
      autoIndex: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5,
      minPoolSize: 1,
    };
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async retryConnection(uri, options, retries = 3, delay = 2000) {
    for (let i = 0; i < retries; i++) {
      try {
        return createConnection(uri, options);
      } catch (err) {
        this.log(`[Mongo] Retry ${i + 1} failed: ${err.message}`, "warn");
        if (i < retries - 1) {
          await this.delay(delay);
        }
      }
    }
    throw new Error("Mongo connection retries exhausted.");
  }

  async getConnection(dbName) {
    if (this.connections[dbName] && this.connections[dbName].readyState === 1) {
      return this.connections[dbName];
    }

    if (this.pendingConnections[dbName]) {
      return this.pendingConnections[dbName];
    }

    try {
      this.log(
        `[Mongo] Attempting to connect to database: "${dbName}"`,
        "info"
      );
      this.pendingConnections[dbName] = this.retryConnection(
        this.getConnectionString(dbName),
        this._defaultOptions
      );
      const conn = await this.pendingConnections[dbName];

      conn.on("connected", () => {
        this.log(`[Mongo] Connected to "${dbName}"`, "info");
      });

      conn.on("error", (err) => {
        this.log(`[Mongo] Error in "${dbName}": ${err.message}`, "error");
      });

      conn.on("disconnected", () => {
        this.log(`[Mongo] Disconnected from "${dbName}"`, "info");
      });

      conn.on("reconnectFailed", () => {
        this.log(
          `[Mongo] Failed to reconnect to "${dbName}" after retries`,
          "error"
        );
      });

      this.connections[dbName] = conn;
      delete this.pendingConnections[dbName];

      return conn;
    } catch (error) {
      delete this.pendingConnections[dbName];
      this.log(
        `[Mongo] Connection failed to "${dbName}": ${error.message}`,
        "error"
      );
      throw error;
    }
  }

  async shutdown() {
    try {
      this.log(`[Mongo] Shutting down and closing all connections...`, "info");
      const shutdownPromises = Object.keys(this.connections).map((dbName) =>
        this.connections[dbName].close()
      );

      await Promise.all(shutdownPromises);
      this.log(`[Mongo] All MongoDB connections closed.`, "info");
    } catch (error) {
      this.log(`[Mongo] Error during shutdown: ${error.message}`, "error");
    }
  }

  getConnectionString(dbName) {
    const params = `replicaSet=rs0&authSource=admin&serverSelectionTimeoutMS=2000&directConnection=true`;
    const baseUri = `mongodb://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port}`;
    this.connectionString = `${baseUri}/${dbName}?${params}`;
    return this.connectionString;
  }

  getAllConnections() {
    return this.connections;
  }

  getConnectionStatus() {
    return Object.entries(this.connections).map(([name, conn]) => ({
      dbName: name,
      readyState: conn.readyState,
    }));
  }

  async closeConnection(dbName) {
    if (this.connections[dbName]) {
      try {
        await this.connections[dbName].close();
        this.log(`[Mongo] Connection to "${dbName}" closed.`, "info");
        delete this.connections[dbName];
      } catch (error) {
        this.log(
          `[Mongo] Error closing connection to "${dbName}": ${error.message}`,
          "error"
        );
      }
    }
  }
}

export default MongoConnectionManager;
