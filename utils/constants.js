const Joi = require("joi");

const customResourceResponse = {}; // create empty objectl

customResourceResponse.success = {
  statusCode: 200,
  message: "Request has been processed successfully.",
};
customResourceResponse.reqCreated = {
  statusCode: 201,
  message: "User has been created successfully.",
};
customResourceResponse.recordNotFound = {
  statusCode: 400,
  message: "No record found.",
};
customResourceResponse.serverError = {
  statusCode: 500,
  message: "Internal server error.",
};
customResourceResponse.reqValidationError = {
  statusCode: 422,
  message: "Data validation failed.",
};
customResourceResponse.noUserFound = {
  statusCode: 400,
  message: "User does not exist. Please SignUp first.",
};
customResourceResponse.invalidCreadintial = {
  statusCode: 400,
  message: "Username or password incorrect",
};
customResourceResponse.invalidTokenAccess = {
  statusCode: 401,
  message: "Invalid Token access",
};

// Define the Joi schema for login
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email",
    "string.empty": "Email cannot be empty",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters long",
    "string.empty": "Password cannot be empty",
    "any.required": "Password is required",
  }),
}).unknown(true);

// Define Joi schemas for each field
const userSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "any.required": "Name is required",
    "string.empty": "Name cannot be empty",
  }),
  address: Joi.string().trim().required().messages({
    "any.required": "Address is required",
    "string.empty": "Address cannot be empty",
  }),
  email: Joi.string().trim().email().required().messages({
    "any.required": "Email is required",
    "string.empty": "Email cannot be empty",
    "string.email": "Invalid email format",
  }),
  password: Joi.string().trim().required().messages({
    "any.required": "Password is required",
    "string.empty": "Password cannot be empty",
  }),
}).unknown(true);

// Define Joi schema for user update
const reservationValidationSchema = Joi.object({
  customer_name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Customer name is required",
    "string.min": "Customer name must be at least 2 characters",
    "string.max": "Customer name must be less than 100 characters",
  }),

  customer_email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Customer email is required",
  }),

  phone_number: Joi.string()
    .pattern(/^[0-9+\-()\s]{7,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid phone number",
      "string.empty": "Phone number is required",
    }),

  reservation_date: Joi.date().greater("now").required().messages({
    "date.base": "Reservation date must be a valid date",
    "date.greater": "Reservation date must be in the future",
    "any.required": "Reservation date is required",
  }),

  number_of_guests: Joi.number().integer().min(1).max(50).required().messages({
    "number.base": "Number of guests must be a number",
    "number.min": "At least one guest is required",
    "number.max": "Too many guests for one reservation",
  }),

  special_requests: Joi.string().allow("", null).max(500).messages({
    "string.max": "Special requests must be less than 500 characters",
  })
}).unknown(true);

module.exports = {
  customResourceResponse,
  loginSchema,
  userSchema,
  reservationValidationSchema,
};
