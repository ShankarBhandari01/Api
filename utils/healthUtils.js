export const toMB = (bytes) => (bytes / 1024 / 1024).toFixed(2);

export const formatMemoryUsage = (memory) => ({
  rss: `${toMB(memory.rss)} MB`,
  heapTotal: `${toMB(memory.heapTotal)} MB`,
  heapUsed: `${toMB(memory.heapUsed)} MB`,
  external: `${toMB(memory.external)} MB`,
});

export const analyzeDbStatus = (connections) => {
  const isDbUp = connections.every((conn) => conn.readyState === 1);
  const dbStatus = connections.map((conn) => ({
    name: conn.dbName,
    state: conn.readyState === 1 ? "connected" : "disconnected",
  }));
  return { isDbUp, dbStatus };
};
