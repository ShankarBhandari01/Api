const Joi = require('joi');

const customResourceResponse = {}; // create empty objectl

customResourceResponse.success = { statusCode: 200, message: 'Request has been processed successfully.' };
customResourceResponse.reqCreated = { statusCode: 201, message: 'User has been created successfully.' };
customResourceResponse.recordNotFound = { statusCode: 404, message: 'No record found.' };
customResourceResponse.serverError = { statusCode: 500, message: 'Internal server error.' };
customResourceResponse.reqValidationError = { statusCode: 422, message: 'Data validation failed.' };
customResourceResponse.noUserFound = { statusCode: 400, message: 'User does not exist. Please SignUp first.' };
customResourceResponse.invalidCreadintial = {statusCode: 400, message: 'Username or password incorrect'};
customResourceResponse.invalidTokenAccess = { statusCode: 401, message: "Invalid Token access" };



// Define the Joi schema for login
const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email',
      'string.empty': 'Email cannot be empty',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.empty': 'Password cannot be empty',
      'any.required': 'Password is required',
    }),
  }).unknown(true);


  // Define Joi schemas for each field
const userSchema = Joi.object({
    name: Joi.string().trim().required().messages({
      'any.required': 'Name is required',
      'string.empty': 'Name cannot be empty',
    }),
    address: Joi.string().trim().required().messages({
      'any.required': 'Address is required',
      'string.empty': 'Address cannot be empty',
    }),
    email: Joi.string().trim().email().required().messages({
      'any.required': 'Email is required',
      'string.empty': 'Email cannot be empty',
      'string.email': 'Invalid email format',
    }),
    password: Joi.string().trim().required().messages({
      'any.required': 'Password is required',
      'string.empty': 'Password cannot be empty',
    }),
  }).unknown(true);
  module.exports = {customResourceResponse,loginSchema,userSchema}
