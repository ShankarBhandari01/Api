const { UserRepository } = require("../repo/userRepo");
const { UserService } = require("../services/userService");
const UserModel = require("../model/UserModel");

const RequestHandler = require("../utils/RequestHandler");
const Logger = require("../utils/logger");
const userRepository = new UserRepository(UserModel);
const userService = new UserService(userRepository);

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

exports.Signup = async (req, res) => {
  try {
    const response = await userService.doSignUp(req.body);
    return requestHandler.sendSuccess(res, "User Data Created ")(response);
  } catch (err) {
    return requestHandler.sendError(req, res, err);
  }
};
exports.login = async (req, res) => {
  try {
    const response = await userService.doLogin(req.body);
    return requestHandler.sendSuccess(res, "User login ")(response);
  } catch (err) {
    return requestHandler.sendError(req, res, err);
  }
};
