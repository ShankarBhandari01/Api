// utils/logger.js
import { createLogger, format, transports } from "winston";
import { existsSync, mkdirSync } from "fs";
import DailyRotate from "winston-daily-rotate-file";
import appconfig from "../config/appconfig.js";

const { env } = appconfig.app;
const logDir = "log";
const isDev = env === "development" || env === "test" || env === "production";
const logInstance = process.env.LOG_INSTANCE === "true";
const instanceId = process.env.NODE_APP_INSTANCE || "0";

if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

// Append instance ID to metadata if enabled
const appendInstanceFormat = format((info) => {
  if (logInstance) {
    info.instance = instanceId;
  }
  return info;
});

// JSON file format
const jsonFormat = format.combine(
  appendInstanceFormat(),
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
);

// Pretty console format
const prettyFormat = format.combine(
  appendInstanceFormat(),
  format.colorize(),
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ timestamp, level, message, instance, ...meta }) => {
    const extra = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : "";
    const tag = instance ? `[instance:${instance}]` : "";
    return `${timestamp} ${level}: ${tag} ${message} ${extra}`;
  })
);

// File transport factory
const createDailyRotateTransport = (name) =>
  new DailyRotate({
    filename: `${logDir}/%DATE%-${name}.log`,
    datePattern: "YYYY-MM-DD",
    maxFiles: "4d",
    zippedArchive: true,
    format: jsonFormat,
  });

// Build logger
const buildLogger = (level, fileLabel) => {
  const transportList = [createDailyRotateTransport(fileLabel)];

  if (isDev) {
    transportList.unshift(
      new transports.Console({ level, format: prettyFormat })
    );
  }

  return createLogger({
    level,
    transports: transportList,
    exitOnError: false,
  });
};

// Create individual loggers
const infoLogger = buildLogger("info", "info-results");
const warnLogger = buildLogger("warn", "warnings-results");
const errorLogger = buildLogger("error", "errors-results");
const allLogger = buildLogger("debug", "all-results");

// Logger class
class Logger {
  log(message, severity = "info", data = {}) {
    const meta = typeof data === "object" ? data : { data };

    switch (severity) {
      case "error":
        errorLogger.error(message, meta);
        break;
      case "warn":
        warnLogger.warn(message, meta);
        break;
      case "info":
      default:
        infoLogger.info(message, meta);
        break;
    }

    allLogger.log(severity, message, meta);
  }
}

export default Logger;
