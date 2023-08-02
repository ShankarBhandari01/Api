const winston = require('winston');
exports.logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ level, message, timestamp }) => {
        const colors = {
          error: '\x1b[31m', // Red
          warn: '\x1b[33m',  // Yellow
          info: '\x1b[36m',  // Cyan
          debug: '\x1b[35m', // Magenta
          default: '\x1b[0m', // Reset to default color
        };
        const color = colors[level] || colors.default;
        return `${color}[${level.toUpperCase()}]${colors.default} ${timestamp} - ${message}`;
      })
    ),
    transports: [
      new winston.transports.Console(), // Logs to console
    ]
  });
