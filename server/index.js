import express, { json, urlencoded, static as expressStatic } from "express";
import session from "express-session";
import methodOverride from "method-override";
import compression from "compression";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import config from "../config/appconfig.js";
import Logger from "../utils/logger.js";
import EmailMarketingJobManager from "../jobs/EmailMarketingJobManager.js";

import indexRoutes from "../router/index.js";
import corsMiddleware from "../middleware/CorsMiddleware.js";
import requestLogger from "../middleware/RequestLogger.js";
import { loggingMiddleware } from "../middleware/LogMiddleware.js";
import { languageMiddleware } from "../middleware/languageMiddleware.js";
import { apiLimiter } from "../middleware/RequestRateLimiter.js";
import { metricsMiddleware } from "../middleware/metricsMiddleware.js";
import {
  csrfTokenMiddleware,
  csrfProtection,
} from "../middleware/csrfMiddleware.js";
import { monitorMemory } from "../utils/memoryMonitor.js";
import helmet from "helmet";
import memorystore from "memorystore";

const MemoryStore = memorystore(session);

const app = express();
const logger = new Logger();
const job = new EmailMarketingJobManager();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// === System Settings ===
app.set("trust proxy", 1);
app.set("config", config);
app.set("port", process.env.DEV_APP_PORT);
// ===secure HTTP headers===
app.use(helmet());

// === Middleware ===
app.use(cookieParser());
if (process.env.NODE_ENV === "production") {
 // app.use(csrfProtection);
}
app.use(
  session({
    secret: config.auth.jwt_secret,
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({ checkPeriod: 86400000 }), // 1 day
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000,
    },
  })
);
app.use(compression());
app.use(methodOverride());
app.use(corsMiddleware);
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(requestLogger);
app.use(languageMiddleware);
app.use(loggingMiddleware);
app.use(apiLimiter);
//app.use(metricsMiddleware);

// === Static Assets ===
app.use(
  "/public",
  expressStatic(join(__dirname, "../public/images"), {
    dotfiles: "ignore",
    etag: false,
  })
);

// === Routes ===
app.use(indexRoutes);
// CSRF Token Middleware to expose token
app.use(csrfTokenMiddleware);

// === 404 Handler ===
app.use((req, res) => {
  const message = "The URL you are trying to reach is not hosted on our server";
  logger.log(message, "error");
  res.status(404).json({ type: "error", message });
});

// === Email Marketing Job ===
//job.init();

//=== Memory Monitoring ===
if (process.env.NODE_ENV !== "production") {
  setInterval(() => {
    logger.log("Memory usage check", "info");
    monitorMemory({ rss: 150, heapUsed: 120 });
  }, 60000); // 1 minute
}

// === Export App ===
export default app;
