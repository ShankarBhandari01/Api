const express = require("express");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const compression = require("compression");
const config = require("../config/appconfig.js");
const Logger = require("../utils/logger.js");
const path = require("path");
const { loggingMiddleware } = require("../middleware/LogMiddleware.js");
const { languageMiddleware } = require("../middleware/languageMiddleware");
const corsMiddleware = require("../middleware/CorsMiddleware.js");
const requestLogger = require("../middleware/RequestLogger");
const EmailMarketingJobManager = require("../jobs/EmailMarketingJobManager.js");

const app = express();
const logger = new Logger();
const job = new EmailMarketingJobManager();

app.set("config", config); // the system configrations
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
app.use(require("method-override")());
// Apply CORS middleware globally
app.use(corsMiddleware);
app.use(express.json());
// Middleware to parse urlencoded form data
app.use(express.urlencoded({ extended: true }));
//the request logging middleware
app.use(requestLogger);
// the language middleware
app.use(languageMiddleware);
// Middleware to log API requests and responses
app.use(loggingMiddleware);
//test url
app.get("/", (req, res) => res.send("Hello, world!"));
// Register the Email Marketing Job when the server starts
job.init();
//access the upload endpoint for images
app.use(
  "/public",
  express.static(path.join(__dirname, "../public/images"), {
    dotfiles: "ignore", // Don't expose files that start with '.'
    etag: false, // Disable etags to improve performance
  })
);
//api routers
app.use(require("../router/index.js"));
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
module.exports = app;
