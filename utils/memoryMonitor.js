// utils/memoryMonitor.js
export function monitorMemory(thresholds = { rss: 150, heapUsed: 100 }) {
  const usage = process.memoryUsage();
  const MB = (bytes) => (bytes / 1024 / 1024).toFixed(2);

  const memoryReport = {
    rss: Number(MB(usage.rss)),
    heapUsed: Number(MB(usage.heapUsed)),
    heapTotal: Number(MB(usage.heapTotal)),
    external: Number(MB(usage.external)),
  };

  if (memoryReport.rss > thresholds.rss) {
    console.warn(`[Memory Alert] RSS exceeds ${thresholds.rss} MB: ${memoryReport.rss} MB`);
  }

  if (memoryReport.heapUsed > thresholds.heapUsed) {
    console.warn(`[Memory Alert] heapUsed exceeds ${thresholds.heapUsed} MB: ${memoryReport.heapUsed} MB`);
  }

  return memoryReport;
}
