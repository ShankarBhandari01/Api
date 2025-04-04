const jwt = require("jsonwebtoken");
const config = require("../config/appconfig");
const BaseRepo = require("../repo/BaseRepo");
const lodash = require("lodash");
const resources = require("../utils/constants");

class BaseService extends BaseRepo {
  constructor() {
    super();
  }

  async assignToken(user, session) {
    let tokens = {};
    try {
      // Set the options for token generation
      const options = {
        expiresIn: config.auth.jwt_expiresin, // Token will expire in 1 day
        algorithm: "HS256",
        issuer: "restaurant-pos-api",
        subject: "login",
        audience: "user",
      };

      // Store user data in the session
      session.user = {
        id: user._id,
        username: user.email,
        role: user.role,
        name: user.name,
        profile: user.profileBase64,
      };
      // selecting user data to be stored in token
      const sessionuser = session.user;
      // remove profile picture for session
      const sanitizedSession = lodash.omit(sessionuser, ["profile"]);
      // create token with session data
      const token = jwt.sign(
        { sanitizedSession },
        config.auth.jwt_secret,
        options
      );
      // refresh token ß
      const refreshToken = jwt.sign(
        { sanitizedSession },
        config.auth.refresh_token_secret,
        {
          expiresIn: config.auth.refresh_token_expiresin,
        }
      );

      tokens.token = token;
      tokens.refreshToken = refreshToken;
      // save token in database
      await super.saveTokens(tokens, session.user);
    } catch (err) {
      return Promise.reject(err);
    }
    return tokens;
  }

  async doRecording(log) {
    try {
      const result = await super.insertUserLog(log);
      return result._id;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async updateLogStatus(msg, logId) {
    try {
      const result = await super.updateLogMsg(msg, logId);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getCurrentUserToken(inputToken) {
    try {
      return await super.getCurrentUserToken(inputToken);
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async logout(userId) {
    try {
      return await super.logout(userId);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  prepareResponse(data, type = "") {
    const response = {};
    response.rsType = type;
    if (!data) {
      response.message =
        resources.customResourceResponse.recordNotFound.message;
      response.statusCode =
        resources.customResourceResponse.recordNotFound.statusCode;
      response.data = data;
      return response;
    }
    response.message = resources.customResourceResponse.success.message;
    response.statusCode = resources.customResourceResponse.success.statusCode;
    response.data = data;
    return response;
  }
}

module.exports = BaseService;
