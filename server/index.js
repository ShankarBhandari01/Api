import express, { json, urlencoded, static as expressStatic } from "express";
import session from "express-session";
import methodOverride from "method-override";
import memorystore from "memorystore";
import compression from "compression";
import config from "../config/appconfig.js";
import Logger from "../utils/logger.js";
import { loggingMiddleware } from "../middleware/LogMiddleware.js";
import { languageMiddleware } from "../middleware/languageMiddleware.js";
import corsMiddleware from "../middleware/CorsMiddleware.js";
import requestLogger from "../middleware/RequestLogger.js";
import EmailMarketingJobManager from "../jobs/EmailMarketingJobManager.js";
import index from "../router/index.js";
import rateLimit from "../middleware/rateLimiter.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import cookieParser from "cookie-parser";
import {
  csrfTokenMiddleware,
  csrfProtection,
} from "../middleware/csrfMiddleware.js";

const app = express();
const logger = new Logger();
const job = new EmailMarketingJobManager();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set("config", config); // the system configrations
// the system configrations
const MemoryStore = memorystore(session);
//For CSRF protection
app.use(cookieParser());
// user session
app.use(
  session({
    secret: config.auth.jwt_secret,
    resave: false,
    store: new MemoryStore({
      checkPeriod: 1000 * 60 * 60 * 24,
    }),
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24,
    }, // 1 day
  })
);

//app.set("db", require("../database/ConnectionManager.js"));
app.set("port", process.env.DEV_APP_PORT);
app.use(compression());
app.use(methodOverride());
// Apply CORS middleware globally
app.use(corsMiddleware);
app.use(json());
// Middleware to parse urlencoded form data
app.use(urlencoded({ extended: true }));
//the request logging middleware
app.use(requestLogger);
// the language middleware
app.use(languageMiddleware);
// Middleware to log API requests and responses
app.use(loggingMiddleware);
// rate limiting middleware apply globally
app.use(rateLimit);

//test url
app.get("/", (req, res) => res.send("Hello, world!"));
// Register the Email Marketing Job when the server starts
//job.init();
//access the upload endpoint for images
app.use(
  "/public",
  expressStatic(join(__dirname, "../public/images"), {
    dotfiles: "ignore", // Don't expose files that start with '.'
    etag: false, // Disable etags to improve performance
  })
);
//api routers
app.use(index);
// CSRF Protection Middleware for sensitive routes
app.use(csrfProtection);
// CSRF Token Middleware - Exposes CSRF token to frontend
app.use(csrfTokenMiddleware);
// 404 handle
app.use((req, res, next) => {
  var message = "the url you are trying to reach is not hosted on our server";
  logger.log(message, "error");

  const err = new Error("Not Found");
  err.status = 404;
  res.message = message;
  res.status(err.status).json({
    type: "error",
    message: message,
  });
  return;
});
// export app
export default app;
