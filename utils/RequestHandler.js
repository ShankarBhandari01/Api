import pkg from "lodash";
const { isNull, isUndefined } = pkg;
import Logger from "../utils/logger.js";

class RequestHandler extends Logger {
  throwIf(
    res,
    fn,
    status = 400,
    errorType = "Invalid",
    errorMessage = "Error"
  ) {
    res.message = errorMessage?.message || errorMessage;
    return (result) =>
      fn(result)
        ? this.throwError(res, status, errorType, errorMessage)()
        : result;
  }

  validateJoi(
    res,
    err,
    status = 400,
    errorType = "ValidationError",
    errorMessage = "Invalid request"
  ) {
    res.message = errorMessage?.message || errorMessage;
    if (err) {
      this.log(
        `Validation error: ${JSON.stringify(err.details || err)}`,
        "warn"
      );
      return this.throwError(res, status, errorType, errorMessage)();
    }
    return "";
  }

  throwError(
    res = null,
    status = 400,
    errorType = "Error",
    errorMessage = "Something went wrong"
  ) {
    if (res) {
      res.message = errorMessage?.message || errorMessage;
    }

    return (e) => {
      const error = e || new Error(errorMessage);
      error.status = status;
      error.errorType = errorType;
      throw error;
    };
  }

  catchError(res, error = new Error("Unhandled error")) {
    this.log(`Caught error: ${error.message}`, "error");

    return res.status(error.status || 500).json({
      type: "error",
      message: error.message || "Unhandled error",
      error,
    });
  }

  sendSuccess(res, message = "Success", status = 200) {
    res.message = message;
    this.log(
      `Request processed successfully at: ${new Date().toISOString()}`,
      "info"
    );
    return (data = {}, globalData = {}) => {
      res.status(status).json({
        type: "success",
        message,
        data,
        ...globalData,
      });
    };
  }

  sendError(req, res, error = new Error("Unhandled error")) {
    try {
      const statusCode = error.status || 500;
      const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

      this.log(`Error at ${url} - ${error.message}`, "error");

      return res.status(statusCode).json({
        type: "error",
        message: error.message || "Unhandled error",
        error,
      });
    } catch (err) {
      this.log(`Error in sendError: ${err.message}`, "error");
      return res.status(500).json({
        type: "error",
        message: "Internal server error",
        error: err,
      });
    }
  }
}

export default RequestHandler;
