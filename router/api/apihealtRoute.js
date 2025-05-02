import { Router } from "express";
import mongoManager from "../../database/ConnectionManager.js";
import { formatMemoryUsage, analyzeDbStatus } from "../../utils/healthUtils.js";
import metricsRegistry from "../../utils/metrics.js";

const router = Router();

router.get("/health", async (req, res) => {
  try {
    const connections = mongoManager.getConnectionStatus();
    const { isDbUp, dbStatus } = analyzeDbStatus(connections);
    const memoryUsage = formatMemoryUsage(process.memoryUsage());

    res.status(isDbUp ? 200 : 503).json({
      status: isDbUp ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      database: dbStatus,
      memoryUsage,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Health check failed",
      error: error.message,
    });
  }
});

router.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", metricsRegistry.contentType);
    res.end(await metricsRegistry.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

export default router;
