const express = require("express");
const session = require("express-session");

const compression = require("compression");
const uuid = require("uuid");
const config = require("../config/appconfig.js");
const Logger = require("../utils/logger.js");
const path = require("path");
const { loggingMiddleware } = require("../middleware/LogMiddleware.js");
const corsMiddleware = require("../middleware/CorsMiddleware.js");
const requestLogger = require("../middleware/RequestLogger");
const app = express();
const logger = new Logger();

app.set("config", config); // the system configrations

// user session
app.use(
  session({
    secret: config.auth.jwt_secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only set secure cookies in production (requires HTTPS)
      maxAge: 1000 * 60 * 60 * 24,
    }, // 1 day
  })
);

app.set("db", require("../database/db.js"));
app.set("port", process.env.DEV_APP_PORT);

app.use(compression());
app.use(require("method-override")());

// Apply CORS middleware globally
app.use(corsMiddleware);

app.use(express.json());
// Middleware to parse urlencoded form data
app.use(express.urlencoded({ extended: true }));
// Middleware to log API requests and responses
app.use(loggingMiddleware);
//the request logging middleware
app.use(requestLogger);

//test url
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

//access the upload endpoint for images
app.use(
  "/public",
  express.static(path.join(__dirname, "../public/images"), {
    dotfiles: "ignore", // Don't expose files that start with '.'
    etag: false, // Disable etags to improve performance
  })
);

app.use(require("../router/index.js"));

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

module.exports = app;
