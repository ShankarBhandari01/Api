
const winston = require('winston');

const consoleTransport = new winston.transports.Console()
const myWinstonOptions = {
    transports: [consoleTransport]
}
const logger = new winston.createLogger(myWinstonOptions)


 function logRequest (req, res, next) {
    logger.info(req.url)
    next()
}

// export function logError(err, req, res, next) {
//     logger.error(err)
//     next()
// }
module.export ={logger, logRequest}

