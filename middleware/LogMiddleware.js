const UserloginLog = require("../models/UserloginLog");
const BaseService = require("../services/BaseService");
const Logger = require("../utils/logger");
const lodash = require("lodash");

const baseService = new BaseService();
const logger = new Logger();

exports.loggingMiddleware = (req, res, next) => {
  const start = Date.now();

  // Capture response details asynchronously after request is finished
  const finish = async () => {
    try {
      const responseTime = Date.now() - start;
      const postData = req.body || {};

      // Ensure postData is a plain object if it's a Mongoose document
      const plainPostData =
        typeof postData.toObject === "function" ? postData.toObject() : postData;

      // Omit sensitive fields like password and any other sensitive data
      const sanitizedResponse = lodash.omit(plainPostData, ["password"]);

      // Create a new log entry
      const log = new UserloginLog({
        requestData: JSON.stringify(sanitizedResponse),
        userAgent: req.headers["user-agent"] || "",
        platform: req.headers.platform || "unknown platform",
        timestamp: new Date(),
        method: req.method,
        ipAddress: `${req.protocol}://${req.get("host")}${req.originalUrl}` || "",
        statusMsg: res.message || "",
        email: req.body.email || "", // Capture email (could be null or empty in some cases)
        responseTime,
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
