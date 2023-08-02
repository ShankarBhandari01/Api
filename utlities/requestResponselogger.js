// requestLogger.js

const util = require('util');
const { logger } = require('./logger');

exports.requestLogger = (req, res, next) => {
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ipAddress = req.ip;
  const userAgent = req.get('user-agent');

  const logMessage = util.format(
    '%s %s - IP: %s, User-Agent: %s, \n%s---> %s ---> End',
    method,
    url,
    ipAddress,
    userAgent,
    method,
    JSON.stringify(req.body, null, 2)
  );

  logger.error(logMessage);
  next();
};
exports.responseLogger = (req, res, next) => {
  const date = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ipAddress = req.ip;
  const userAgent = req.get('user-agent');

  // Save the original end function of the response
  const originalEnd = res.end;

  // Create a buffer to capture the response data
  const chunks = [];
  res.write = function (chunk) {
    chunks.push(chunk);
    return true;
  };

  // Override the end function to log the response data
  res.end = function (chunk) {
    if (chunk) chunks.push(chunk);
    const responseData = Buffer.concat(chunks).toString();
    let prettyResponseData;
    try {
      prettyResponseData = JSON.stringify(JSON.parse(responseData), null, 2);
    } catch (error) {
      // If the response data is not valid JSON, handle the error or use the original data
      prettyResponseData = responseData;
    }
    // Restore the original end function
    res.end = originalEnd;
    res.write = res.write;

    const responseTime = Date.now() - req.startTime;
    const logMessage = util.format(
      '%s %s - IP: %s, User-Agent: %s, Status: %s, Response Time: %dms\n Response Data :<---- %s<----END',
      method,
      url,
      ipAddress,
      userAgent,
      res.statusCode,
      responseTime,
      prettyResponseData
    );

    logger.info(logMessage);
    res.end(chunk);
  };
  next();
};