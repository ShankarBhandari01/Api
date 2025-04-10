const {
  loginSchema,
  userSchema,
  reservationValidationSchema,
} = require("../utils/constants");
const RequestHandler = require("../utils/RequestHandler");
const requestHandler = new RequestHandler();

// Validation middleware using Joi
exports.validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    error.details.map((err) => ({
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
    error.details.map((err) => ({
      field: err.path[0],
      message: err.message,
    }));
    return requestHandler.sendError(req, res, error);
  }
  next();
};

exports.reservationValidationSchema = (req, res, next) => {
  const { error } = reservationValidationSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    error.details.map((err) => ({
      field: err.path[0],
      message: err.message,
    }));
    return requestHandler.sendError(req, res, error);
  }
  next();
};
