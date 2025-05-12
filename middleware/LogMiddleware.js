import UserloginLog from "../models/UserloginLog.js";
import BaseService from "../services/BaseService.js";
import Logger from "../utils/logger.js";
import pkg from "lodash";
const { omit } = pkg;

const logger = new Logger();
let responseData = {};
export function loggingMiddleware(req, res, next) {
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
      const sanitizedResponse = omit(plainPostData, ["password"]);

      // log database connection string
      const mongoConnectionManager = req.scope.resolve(
        "mongoConnectionManager"
      );
      const connection = await mongoConnectionManager.getConnection(
        "ApiLogDatabase"
      );
      const userlogModel = UserloginLog(connection);

      const baseService = new BaseService();

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
}
