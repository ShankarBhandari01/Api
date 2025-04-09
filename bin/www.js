#!/usr/bin/www.js

/**
 * Module dependencies.
 */
const http = require('http');
const app = require('../server/index');
const Logger = require('../utils/logger');
const logger = new Logger();

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.DEV_APP_PORT || '8080');
app.set('port', port);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.log(`${bind} requires elevated privileges`, 'error');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.log(`${bind} is already in use`, 'error');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;

  logger.log(`Server started and listening on ${bind}`, 'info');
}

/**
 * Graceful shutdown handler
 */
function gracefulShutdown(signal) {
  logger.log(`Received ${signal}. Shutting down gracefully...`, 'info');

  // Close any active database connection
  const dbConnection = app.get('db');
  if (dbConnection && dbConnection.close) {
    dbConnection.close(() => {
      logger.log("Database connection closed successfully.", 'info');
    });
  }

  // Close the HTTP server
  server.close(() => {
    logger.log("HTTP server closed successfully", 'info');
    process.exit(0);
  });

  // Force shutdown if server does not close in time
  setTimeout(() => {
    logger.log("Forced shutdown due to timeout", 'error');
    process.exit(1);
  }, 30000); // 30 seconds timeout
}

/**
 * Listen on provided port, on all network interfaces.
 */
logger.log(`Running in ${process.env.NODE_ENV || 'development'} mode`, 'info');
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

// Graceful shutdown on SIGINT and SIGTERM signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions (for debugging)
process.on('uncaughtException', (err) => {
  logger.log(`Uncaught Exception: ${err.message}`, 'error');
  logger.log(err.stack, 'error');
  process.exit(1); // Exit with failure code
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.log(`Unhandled Promise Rejection: ${err.message}`, 'error');
  logger.log(err.stack, 'error');
  process.exit(1); // Exit with failure code
});
