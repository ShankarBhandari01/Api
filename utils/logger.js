import { createLogger, format, transports } from "winston";
import { existsSync, mkdirSync } from "fs";
import DailyRotate from "winston-daily-rotate-file";
import appconfig from "../config/appconfig.js";

const { env } = appconfig.app;
const logDir = "log";

let infoLogger;
let errorLogger;
let warnLogger;
let allLogger;

class Logger {
  constructor() {
    if (!existsSync(logDir)) {
      mkdirSync(logDir);
    }

    const commonDailyRotateOptions = {
      datePattern: "YYYY-MM-DD",
      maxFiles: "4d", 
      zippedArchive: true,
    };

    infoLogger = createLogger({
      level: env === "development" ? "info" : "debug",
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
      transports: [
        new transports.Console({
          level: "info",
          format: format.combine(
            format.colorize(),
            format.printf(
              (info) => `${info.timestamp} ${info.level}: ${info.message}`
            )
          ),
        }),
        new DailyRotate({
          filename: `${logDir}/%DATE%-info-results.log`,
          ...commonDailyRotateOptions,
        }),
      ],
      exitOnError: false,
    });

    errorLogger = createLogger({
      level: env === "development" ? "info" : "debug",
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(
          (error) => `${error.timestamp} ${error.level}: ${error.message}`
        )
      ),
      transports: [
        new transports.Console({
          level: "error",
          format: format.combine(
            format.colorize(),
            format.printf(
              (error) => `${error.timestamp} ${error.level}: ${error.message}`
            )
          ),
        }),
        new DailyRotate({
          filename: `${logDir}/%DATE%-errors-results.log`,
          ...commonDailyRotateOptions,
        }),
      ],
      exitOnError: false,
    });

    warnLogger = createLogger({
      level: env === "development" ? "info" : "debug",
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(
          (warn) => `${warn.timestamp} ${warn.level}: ${warn.message}`
        )
      ),
      transports: [
        new transports.Console({
          level: "warn",
          format: format.combine(
            format.colorize(),
            format.printf(
              (warn) => `${warn.timestamp} ${warn.level}: ${warn.message}`
            )
          ),
        }),
        new DailyRotate({
          filename: `${logDir}/%DATE%-warnings-results.log`,
          ...commonDailyRotateOptions,
        }),
      ],
      exitOnError: false,
    });

    allLogger = createLogger({
      level: env === "development" ? "info" : "debug",
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf((log) => `${log.timestamp} ${log.level}: ${log.message}`)
      ),
      transports: [
        new DailyRotate({
          filename: `${logDir}/%DATE%-results.log`,
          ...commonDailyRotateOptions,
        }),
      ],
      exitOnError: false,
    });
  }

  log(message, severity = "info", data = {}) {
    if (severity === "info") {
      infoLogger.log(severity, message, data);
      allLogger.log(severity, message, data);
    } else if (severity === "error") {
      errorLogger.log(severity, message, data);
      allLogger.log(severity, message, data);
    } else if (severity === "warn") {
      warnLogger.log(severity, message, data);
      allLogger.log(severity, message, data);
    } else {
      infoLogger.log("info", message, data);
      allLogger.log("info", message, data);
    }
  }
}

export default Logger;
