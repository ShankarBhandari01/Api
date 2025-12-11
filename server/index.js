import express, { json, urlencoded, static as expressStatic } from "express";
import container from "../containers/Containers.js";
import methodOverride from "method-override";
import compression from "compression";
//import cookieParser from "cookie-parser";
import config from "../config/appconfig.js";
import indexRoutes from "../router/index.js";
import requestLogger from "../middleware/RequestLogger.js";
import { loggingMiddleware } from "../middleware/LogMiddleware.js";
import { apiLimiter } from "../middleware/RequestRateLimiter.js";
import { metricsMiddleware } from "../middleware/metricsMiddleware.js";
import {
  csrfTokenMiddleware,
  csrfProtection,
} from "../middleware/csrfMiddleware.js";
import createSessionMiddleware from "../middleware/sessionMiddleware.js";
import serveStaticFiles from "../middleware/staticFiles.js";
import { monitorMemory } from "../utils/memoryMonitor.js";
import helmet from "helmet";
import { createTenantScope } from "../middleware/CreateTenantScope.js";

// === express app===
const app = express();

// ===load Dis ===
const {
  redisClientManager,
  emailMarketingJobManager,
  notificationQueueService,
  logger,
  languageMiddleware,
  corsMiddleware,
} = container.cradle;

// === System Settings ===
app.set("trust proxy", 1);
app.set("config", config);
app.set("port", process.env.DEV_APP_PORT);
// ===secure HTTP headers===
app.use(helmet());

// === Middleware ===
//app.use(cookieParser());
if (process.env.NODE_ENV === "production") {
  app.use(csrfProtection);
}
/**
 * Redis client for session store
 */

redisClientManager.connect();
const { pubClient } = redisClientManager.getClients();
const userSession = createSessionMiddleware(pubClient);
app.use(userSession);
app.use(languageMiddleware);
app.use(createTenantScope(container));
app.use(compression());
app.use(methodOverride());
app.use(corsMiddleware);
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(requestLogger);
app.use(loggingMiddleware);
app.use(apiLimiter);
//app.use(metricsMiddleware);
// === Static Assets ===
serveStaticFiles(app);
// === Routes ===
app.use(indexRoutes);
// CSRF Token Middleware to expose token
//app.use(csrfTokenMiddleware);
// === 404 Handler ===
app.use((req, res) => {
  const message = "The URL you are trying to reach is not hosted on our server";
  logger.log(message, "error");
  res.status(404).json({ type: "error", message });
});
// === Email Marketing Job ===
emailMarketingJobManager.init();
//=== Memory Monitoring ===
if (process.env.NODE_ENV === "production") {
  setInterval(() => {
    logger.log("Memory usage check", "info");
    monitorMemory({ rss: 250, heapUsed: 120 });
  }, 60000); // 1 minute
}

// === Export App ===
export default { app, userSession };
