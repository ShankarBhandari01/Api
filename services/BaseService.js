const jwt = require("jsonwebtoken");
const config = require("../config/appconfig");
const BaseRepo = require("../repositories/BaseRepository");
const lodash = require("lodash");
const resources = require("../utils/constants");

class BaseService extends BaseRepo {
  constructor(connection) {
    super(connection);
    this.connection = connection;

    this.options = {
      expiresIn: config.auth.jwt_expiresin,
      algorithm: "HS256",
      issuer: "restaurant-pos-api",
      subject: "access token",
      audience: "user",
    };
  }

  getFcmToken = async () => {
    try {
      return await this.getFcmTokenFromDatabase();
    } catch (error) {
      this.log(`Error sending FCM token ${error}`, "error");
    }
  };

  // Helper function to create JWT token
  generateToken(sessionUser, secret, options) {
    return jwt.sign(
      { sanitizedSession: lodash.omit(sessionUser, ["profile"]) },
      secret,
      options
    );
  }

  // Helper function to generate tokens
  async assignToken(session) {
    try {
      const user = session.user;
      const { profilePic, profileBase64, ...updatedUser } = user;
      // Generate tokens
      const token = this.generateToken(
        updatedUser,
        config.auth.jwt_secret,
        this.options
      );
      const refreshToken = this.generateToken(
        updatedUser,
        config.auth.refresh_token_secret,
        {
          expiresIn: config.auth.refresh_token_expiresin,
        }
      );

      const tokens = { token, refreshToken };
      // save access token
      await super.saveTokens(tokens, session.user);
      // save fcm token
      if (session.firebaseToken) {
        await this.saveFcmToken(session);
      }

      return tokens;
    } catch (err) {
      return Promise.reject(err);
    }
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
      await super.updateLogMsg(msg, logId);
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

  // Simplified logout handling
  async logout(userId) {
    try {
      return await super.logout(userId);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  getSkipNumber(page, limit) {
    return (page - 1) * limit;
  }

  // Optimized response preparation
  prepareResponse(data, type = "") {
    const response = {
      rsType: type,
      message: data
        ? resources.customResourceResponse.success.message
        : resources.customResourceResponse.recordNotFound.message,
      statusCode: data
        ? resources.customResourceResponse.success.statusCode
        : resources.customResourceResponse.recordNotFound.statusCode,
      data: data || null,
    };
    return response;
  }

  // Utility method to handle repetitive try-catch and response preparation
  handleRepositoryCall = async (repositoryMethod, ...params) => {
    try {
      const result = await repositoryMethod(...params);
      return prepareResponse(result);
    } catch (err) {
      throw { message: err.message || "An error occurred", stack: err.stack }; // Add stack trace for debugging
    }
  };
}

module.exports = BaseService;
