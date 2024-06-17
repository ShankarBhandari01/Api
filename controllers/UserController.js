const { UserRepository } = require("../repo/UserRepository");
const { UserService } = require("../services/userService");
const RequestHandler = require("../utils/RequestHandler");
const Logger = require("../utils/logger");
const UserModel = require("../model/UserModel");

const userRepository = new UserRepository(UserModel);
const userService = new UserService(userRepository);

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

exports.signup = async (req, res) => {
  try {
    const response = await userService.doSignUp(req.body);
    return requestHandler.sendSuccess(res, "User Created ")(response);
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
