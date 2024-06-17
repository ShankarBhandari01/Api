const { loginSchema, userSchema } = require("../utils/constants");
const RequestHandler = require("../utils/RequestHandler");
const Logger = require("../utils/logger");

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

// Validation middleware using Joi
exports.validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((err) => ({
      field: err.path[0],
      message: err.message,
    }));
    return requestHandler.sendError(req, res, error);
  }

  next();
};

// Validation middleware
exports.validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return requestHandler.sendError(req, res, error);
  }
  next();
};
