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
    // Set session language only if provided
    if (req.query.lang) {
      req.session.lang = req.query.lang;
    }
    const lang = req.session.lang || "en"; // Default to English

    const bodyData = req.body; // user data
    const image = req.files?.image || null; // Handle missing files safely

    const response = await userService.doSignUp(bodyData, image);
    return requestHandler.sendSuccess(res, "User Created ")(response);
  } catch (err) {
    return requestHandler.sendError(req, res, err);
  }
};
exports.login = async (req, res) => {
  try {
    // Set session language only if provided
    if (req.query.lang) {
      req.session.lang = req.query.lang;
    }
    const lang = req.session.lang || "en"; // Default to English

    const response = await userService.doLogin(req.body, req.session);
    return requestHandler.sendSuccess(res, "User login ")(response);
  } catch (err) {
    return requestHandler.sendError(req, res, err);
  }
};

exports.logout = async (req, res) => {
  try {
    const response = await userService.logout(req.session.user.id);
    if (response) {
      req.session.destroy((err) => {
        if (err) {
          return requestHandler.sendError(req, res, err);
        }
        res.clearCookie("connect.sid");
        return requestHandler.sendSuccess(
          res,
          "User logged out successfully"
        )(response);
      });
    } else {
      return requestHandler.sendError(
        req,
        res,
        new Error("Logout service failed")
      );
    }
  } catch (err) {
    return requestHandler.sendError(req, res, err);
  }
};
