import { v4 as uuidv4 } from 'uuid';
import Logger from "../utils/logger.js";
import pkg from 'lodash';
const { omit } = pkg;
const logger = new Logger();
const requestLogger = (req, res, next) => {
  // Generate a unique identifier for each request
  req.identifier = uuidv4();

  // Start measuring the request processing time
  const start = Date.now();

  // Prepare log for request details
  let bodyLog = "Body not available";
  try {
    // Remove password field if it exists
    const sanitizedBody = omit(req.body, ["password"]);
    bodyLog = JSON.stringify(sanitizedBody);
  } catch (error) {
    bodyLog = "Failed to parse body";
  }

  const logString = `
  [${new Date().toISOString()}] 
  [UUID: ${req.identifier}] 
  [Method: ${req.method}] 
  [URL: ${req.url}] 
  [User-Agent: ${req.headers["user-agent"]}] 
  [Cookies: ${JSON.stringify(req.cookies || req.headers.cookie || {})}] 
  [Body: ${bodyLog}]
`;

  // Log the request details with 'info' level
  logger.log(`\n${logString}`, "info");

  // Log the response status and duration once the response is finished
  res.on("finish", () => {
    const duration = Date.now() - start;
    const responseLog = `
      [UUID: ${req.identifier}] 
      [Status: ${res.statusCode}] 
      [Duration: ${duration}ms] 
    `;
    const logLevel = res.statusCode >= 400 ? "error" : "info";
    logger.log(`\n${responseLog}`, logLevel);
  });

  // Proceed to the next middleware
  next();
};

export default requestLogger;
