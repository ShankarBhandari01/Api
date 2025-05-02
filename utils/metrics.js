import client from 'prom-client';
const register = new client.Registry();

// Default system metrics
client.collectDefaultMetrics({ register, prefix: 'node_', timeout: 5000 });

// ===== Custom Metrics =====

// Total API requests counter
export const apiRequestCount = new client.Counter({
  name: 'api_requests_total',
  help: 'Total number of API requests',
  labelNames: ['method', 'route', 'status'],
});

// API request duration histogram
export const apiRequestDuration = new client.Histogram({
  name: 'api_request_duration_seconds',
  help: 'API request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

// API error counter
export const apiErrorCount = new client.Counter({
  name: 'api_errors_total',
  help: 'Total number of API errors',
  labelNames: ['method', 'route', 'status'],
});

// Memory metrics
const memoryRss = new client.Gauge({
  name: 'node_memory_rss_bytes',
  help: 'Resident Set Size (RSS) memory in bytes',
});
const memoryHeapUsed = new client.Gauge({
  name: 'node_memory_heap_used_bytes',
  help: 'Heap used memory in bytes',
});
const memoryHeapTotal = new client.Gauge({
  name: 'node_memory_heap_total_bytes',
  help: 'Total heap memory in bytes',
});

register.registerMetric(apiRequestCount);
register.registerMetric(apiRequestDuration);
register.registerMetric(apiErrorCount);
register.registerMetric(memoryRss);
register.registerMetric(memoryHeapUsed);
register.registerMetric(memoryHeapTotal);

setInterval(() => {
  const mem = process.memoryUsage();
  memoryRss.set(mem.rss);
  memoryHeapUsed.set(mem.heapUsed);
  memoryHeapTotal.set(mem.heapTotal);
}, 5000); // Update memory metrics every 5 seconds

export default register;
