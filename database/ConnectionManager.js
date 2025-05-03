import { createConnection } from "mongoose";
import { readFileSync } from "fs";
import logger from "../utils/logger.js";
import { fileURLToPath } from 'url';  
import { dirname, join } from 'path'; 

const __filename = fileURLToPath(import.meta.url); 
const __dirname = dirname(__filename);


class MongoConnectionManager extends logger {
  constructor() {
    super();
    this.connections = {};
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

  async retryConnection(uri, options, retries = 3, delay = 2000) {
    for (let i = 0; i < retries; i++) {
      try {
        return await createConnection(uri, options);
      } catch (err) {
        this.log(`[Mongo] Retry ${i + 1} failed: ${err.message}`, "warn");
        if (i < retries - 1) await new Promise((res) => setTimeout(res, delay));
      }
    }
    throw new Error("Mongo connection retries exhausted.");
  }

  async getConnection(dbName) {
    if (this.connections[dbName] && this.connections[dbName].readyState === 1) {
      return this.connections[dbName];
    }

    if (this.pendingConnections[dbName]) {
      return await this.pendingConnections[dbName];
    }

    try {
      this.log(
        `[Mongo] Attempting to connect to database: "${dbName}"`,
        "info"
      );
      let uri;
      if (this.env === "development" || this.env === "test") {
        uri = `mongodb+srv://${this.config.username}:${this.config.password}@${this.config.host}/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;
      } else {
        uri = `mongodb://${this.config.username}:${this.config.password}@127.0.0.1:27017/${dbName}?replicaSet=rs0&authSource=admin&serverSelectionTimeoutMS=2000`;
      }
      this.pendingConnections[dbName] = this.retryConnection(
        uri,
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

export default new MongoConnectionManager();
