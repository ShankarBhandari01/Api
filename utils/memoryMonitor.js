// utils/memoryMonitor.js
import Logger from "./logger.js";
const logger = new Logger();
export function monitorMemory(thresholds = { rss: 150, heapUsed: 100 }) {
  const usage = process.memoryUsage();
  const MB = (bytes) => (bytes / 1024 / 1024).toFixed(2);

  const memoryReport = {
    rss: Number(MB(usage.rss)),
    heapUsed: Number(MB(usage.heapUsed)),
    heapTotal: Number(MB(usage.heapTotal)),
    external: Number(MB(usage.external)),
  };
  // Log the memory report
  console.log(
    `
      [Memory Report] 
      ==== Memory Usage ===
      RSS: ${memoryReport.rss} MB, 
      heapUsed: ${memoryReport.heapUsed} MB, 
      heapTotal: ${memoryReport.heapTotal} MB, 
      external: ${memoryReport.external} MB
      ==== Memory Usage ===`
  );

  if (memoryReport.rss > thresholds.rss) {
    logger.log(
      `[Memory Alert] RSS exceeds ${thresholds.rss} MB: ${memoryReport.rss} MB`,
      "warn"
    );
  }

  if (memoryReport.heapUsed > thresholds.heapUsed) {
    logger.log(
      `[Memory Alert] heapUsed exceeds ${thresholds.heapUsed} MB: ${memoryReport.heapUsed} MB`,
      "warn"
    );
  }

  return memoryReport;
}
