const UserloginLog = require("../models/UserloginLog");
const BaseService = require("../services/BaseService");
const Logger = require("../utils/logger");
const lodash = require("lodash");
const dbConnection = require("../database/ConnectionManager");
const config = require("../config/config.json");

const baseService = new BaseService();
const logger = new Logger();
let responseData = {};
exports.loggingMiddleware = (req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  res.send = (body) => {
    responseData = body;
    originalSend.call(res, body);
  };
  // Capture response details asynchronously after request is finished
  const finish = async () => {
    try {
      const responseTime = Date.now() - start;
      const postData = req.body || {};

      // Ensure postData is a plain object if it's a Mongoose document
      const plainPostData =
        typeof postData.toObject === "function"
          ? postData.toObject()
          : postData;

      // Omit sensitive fields like password and any other sensitive data
      const sanitizedResponse = lodash.omit(plainPostData, ["password"]);

      // database name
      const env = config[process.env.NODE_ENV || "development"];
      // database connection string
      const connection = await dbConnection.getConnection('ApiLogDatabase');
      const userlogModel = UserloginLog(connection);

      // Create a new log entry
      const log = new userlogModel({
        requestData: JSON.stringify(sanitizedResponse),
        userAgent: req.headers["user-agent"] || "",
        platform: req.headers.platform || "unknown platform",
        timestamp: new Date(),
        method: req.method,
        ipAddress:
          `${req.protocol}://${req.get("host")}${req.originalUrl}` || "",
        statusMsg: `${res.statusMessage} : ${res.message || ""}` || "",
        email: req.body.email || "",
        responseTime,
        responseData: JSON.stringify(responseData),
      });

      // Log the entry asynchronously using the base service
      await baseService.doRecording(log);
    } catch (error) {
      logger.log(`Error logging request data: ${error.message}`, "error");
    }
  };

  // Ensure finish function is executed on response finish
  res.on("finish", finish);
  next();
};
