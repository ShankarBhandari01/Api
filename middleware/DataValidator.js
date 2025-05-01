import constants from "../utils/constants.js";
import RequestHandler from "../utils/RequestHandler.js";
const requestHandler = new RequestHandler();

// Validation middleware using Joi
export function validateUser(req, res, next) {
  const { error } = constants.userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    error.details.map((err) => ({
      field: err.path[0],
      message: err.message,
    }));
    return requestHandler.sendError(req, res, error);
  }

  next();
}

// Validation middleware
export function validateLogin(req, res, next) {
  const { error } = constants.loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    error.details.map((err) => ({
      field: err.path[0],
      message: err.message,
    }));
    return requestHandler.sendError(req, res, error);
  }
  next();
}

const _reservationValidationSchema = (req, res, next) => {
  const { error } = constants.reservationValidationSchema.validate(req.body, {
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
export { _reservationValidationSchema as reservationValidationSchema };

export function campaignSchemaValidation(req, res, next) {
  const { error } = constants.campaignSchema.validate(req.body, {
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
}
