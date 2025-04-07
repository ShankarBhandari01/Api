const UserloginLog = require("../models/UserloginLog");
const BaseService = require("../services/BaseService");
const Logger = require("../utils/logger");
const lodash = require("lodash");

const baseService = new BaseService();
const logger = new Logger();
exports.loggingMiddleware = (req, res, next) => {
  const start = Date.now();
  // Capture response details
  const finish = async () => {
    const responseTime = Date.now() - start;

    const postData = req.body || {};

    // Ensure postData is a plain object if it's a Mongoose document
    const plainPostData =
      typeof postData.toObject === "function" ? postData.toObject() : postData;

    // Omit the password field
    const sanitizedResponse = lodash.omit(plainPostData, ["password"]);

    const log = new UserloginLog({
      requestData: JSON.stringify(sanitizedResponse),
      userAgent: req.headers["user-agent"] || "",
      platform: req.headers.platform || "unknown platform",
      timestamp: new Date(),
      method: req.method,
      ipAddress:
        `${`${req.protocol}://${req.get("host")}${req.originalUrl}`}` || "",
      statusMsg: res.message || "",
      email: req.body.email || "",
      responseTime: responseTime,
    });
    await baseService.doRecording(log);
  };

  // Ensure finish function is executed on response finish
  res.on("finish", finish);

  // Call next middleware
  next();
};
