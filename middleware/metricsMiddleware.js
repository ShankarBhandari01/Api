import { apiRequestCount, apiRequestDuration, apiErrorCount } from '../utils/metrics.js';

export function metricsMiddleware(req, res, next) {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9;

    const labels = {
      method: req.method,
      route: req.route?.path || req.originalUrl,
      status: res.statusCode,
    };

    apiRequestCount.inc(labels);
    apiRequestDuration.observe(labels, duration);

    if (res.statusCode >= 500) {
      apiErrorCount.inc(labels);
    }
  });

  next();
}
