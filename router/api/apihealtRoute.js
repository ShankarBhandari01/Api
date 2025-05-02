import { Router } from "express";
import mongoManager from "../../database/ConnectionManager.js";
import { formatMemoryUsage, analyzeDbStatus } from "../../utils/healthUtils.js";

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

export default router;
