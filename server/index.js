const express = require("express");
const session = require("express-session");
const cors = require("cors");
const compression = require("compression");
const uuid = require("uuid");
const config = require("../config/appconfig.js");
const Logger = require("../utils/logger.js");

const { loggingMiddleware } = require("../middleware/LogMiddleware.js");
const app = express();
const logger = new Logger();
app.set("config", config); // the system configrations

// user session
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: true, maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

app.set("db", require("../database/db.js"));
app.set("port", process.env.DEV_APP_PORT);

app.use(compression());
app.use(require("method-override")());

app.use(cors());
app.use(express.json());
// Middleware to parse urlencoded form data
app.use(express.urlencoded({ extended: true }));
// Middleware to log API requests and responses
app.use(loggingMiddleware);

process.on("SIGINT", () => {
  logger.log("stopping the server", "info");
  process.exit();
});

app.use((req, res, next) => {
  req.identifier = uuid();
  const logString = `a request has been made with the following uuid [${
    req.identifier
  }] ${req.url} ${req.headers["user-agent"]} ${JSON.stringify(req.body)}`;
  logger.log(logString, "info");
  next();
});

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
  next(err); // this will stackstre the error
});

module.exports = app;
