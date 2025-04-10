const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

class MongoConnectionManager extends logger {
  constructor() {
    super();
    this.connections = {}; // Store connections per dbName
    this.env = process.env.NODE_ENV || "development";

    // Read config based on environment
    const configPath = path.join(__dirname, "..", "config", "config.json");
    this.config = JSON.parse(fs.readFileSync(configPath))[this.env];

    // Default connection options
    this._defaultOptions = {
      autoIndex: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
    };
  }

  /**
   * Get or create a MongoDB connection for a specific database name.
   * @param {string} dbName - The database name for which the connection is needed.
   */
  async getConnection(dbName) {
    if (this.connections[dbName] && this.connections[dbName].readyState === 1) {
      return this.connections[dbName]; // Return the connection if it's already available and ready
    }

    // If the connection is not available or ready, initiate a new one
    try {
      this.log(`[Mongo] Attempting to connect to database: "${dbName}"`);

      const uri = `mongodb+srv://${this.config.username}:${this.config.password}@${this.config.host}/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

      const conn = await mongoose.createConnection(uri, this._defaultOptions);

      conn.on("connected", () => {
        this.log(`[Mongo] Connected to "${dbName}"`);
      });

      conn.on("error", (err) => {
        this.log(`[Mongo] Error in "${dbName}": ${err.message}`, "error");
      });

      conn.on("disconnected", () => {
        this.log(`[Mongo] Disconnected from "${dbName}"`);
      });

      conn.on("reconnectFailed", () => {
        this.log(`[Mongo] Failed to reconnect to "${dbName}" after retries`, "error");
      });

      // Store the connection for future use
      this.connections[dbName] = conn;
      return conn;
    } catch (error) {
      this.log(`[Mongo] Connection failed to "${dbName}": ${error.message}`, "error");
      throw error;
    }
  }

  /**
   * Gracefully shutdown and close all MongoDB connections.
   */
  async shutdown() {
    try {
      this.log("[Mongo] Shutting down and closing all connections...");
      const shutdownPromises = Object.keys(this.connections).map((dbName) =>
        this.connections[dbName].close()
      );

      // Wait for all connections to close
      await Promise.all(shutdownPromises);
      this.log("[Mongo] All MongoDB connections closed.");
    } catch (error) {
      this.log(`[Mongo] Error during shutdown: ${error.message}`, "error");
    }
  }

  /**
   * Get all active MongoDB connections for diagnostics or health checks.
   */
  getAllConnections() {
    return this.connections;
  }

  /**
   * Ensure that no connection leaks happen by explicitly closing all connections.
   */
  async closeConnection(dbName) {
    if (this.connections[dbName]) {
      try {
        await this.connections[dbName].close();
        this.log(`[Mongo] Connection to "${dbName}" closed.`);
        delete this.connections[dbName]; // Clean up the connection reference
      } catch (error) {
        this.log(`[Mongo] Error closing connection to "${dbName}": ${error.message}`, "error");
      }
    }
  }
}

// Exporting the singleton instance
module.exports = new MongoConnectionManager();
