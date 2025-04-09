const _ = require("lodash");

class RequestHandler {
  constructor(logger) {
    this.logger = logger;
  }

  throwIf(res,fn, status, errorType, errorMessage) {
    res.message = errorMessage.message;
    return (result) =>
      fn(result) ? this.throwError(status, errorType, errorMessage)() : result;
  }

  validateJoi(res,err, status, errorType, errorMessage) {
    res.message = errorMessage.message;
    if (err) {
      this.logger.log(`error in validating request : ${errorMessage}`, "warn");
    }
    return !_.isNull(err)
      ? this.throwError(status, errorType, errorMessage)()
      : "";
  }

  throwError(res=null, status, errorType, errorMessage) {
    if(res){
      res.message = errorMessage;
    }
    return (e) => {
      if (!e) e = new Error(errorMessage || "Default Error");
      e.status = status;
      e.errorType = errorType;
      throw e;
    };
  }

  catchError(res, error) {
    res.message = error.message;
    if (!error) error = new Error("Default error");
    res.status(error.status || 500).json({
      type: "error",
      message: error.message || "Unhandled error",
      error,
    });
  }

  sendSuccess(res, message, status) {
    res.message = message;
    this.logger.log(
      `a request has been made and proccessed successfully at: ${new Date()}`,
      "info"
    );
    return (data, globalData) => {
      if (_.isUndefined(status)) {
        status = 200;
      }
      res.status(status).json({
        type: "success",
        message: message || "Success result",
        data,
        ...globalData,
      });
    };
  }

  sendError(req, res, error) {
    res.message = error.message;
    this.logger.log(
      `error ,Error during processing request: ${`${req.protocol}://${req.get(
        "host"
      )}${req.originalUrl}`} details message: ${error.message}`,
      "error"
    );
    return res.status(400).json({
      type: "error",
      message: error.message || error.message || "Unhandled Error",
      error,
    });
  }
}
module.exports = RequestHandler;
