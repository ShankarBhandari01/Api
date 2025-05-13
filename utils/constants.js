import Joi from "joi";

export const customResourceResponse = {
  success: {
    statusCode: 200,
    message: "Request has been processed successfully.",
  },
  reqCreated: {
    statusCode: 201,
    message: "User has been created successfully.",
  },
  recordNotFound: {
    statusCode: 400,
    message: "No record found.",
  },
  serverError: {
    statusCode: 500,
    message: "Internal server error.",
  },
  reqValidationError: {
    statusCode: 422,
    message: "Data validation failed.",
  },
  noUserFound: {
    statusCode: 400,
    message: "User does not exist. Please SignUp first.",
  },
  invalidCreadintial: {
    statusCode: 400,
    message: "Username or password incorrect",
  },
  invalidTokenAccess: {
    statusCode: 401,
    message: "Invalid Token access",
  },
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
  }),
}).unknown(true);

// Export Joi schemas
const campaignSchema = Joi.object({
  startDate: Joi.date().required().messages({
    "any.required": "Start date is required",
    "date.base": "Start date must be a valid date",
  }),

  endDate: Joi.date().required().messages({
    "any.required": "End date is required",
    "date.base": "End date must be a valid date",
  }),
}).unknown(true);

export default {
  loginSchema,
  userSchema,
  reservationValidationSchema,
  campaignSchema,
};
