import jsonweb from "jsonwebtoken";
import appconfig from "../config/appconfig.js";
import BaseRepo from "../repositories/BaseRepository.js";
import pkg from "lodash";
import { customResourceResponse } from "../utils/constants.js";
const { omit } = pkg;
const { sign } = jsonweb;

class BaseService extends BaseRepo {
  constructor(connection) {
    super(connection);
    this.options = {
      expiresIn: appconfig.auth.jwt_expiresin,
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
      this.log(`[Api] Error sending FCM token ${error}`, "error");
    }
  };

  // Helper function to create JWT token
  generateToken(sessionUser, secret, options) {
    return sign(
      { sanitizedSession: omit(sessionUser, ["profile"]) },
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
        appconfig.auth.jwt_secret,
        this.options
      );
      const refreshToken = this.generateToken(
        updatedUser,
        appconfig.auth.refresh_token_secret,
        {
          expiresIn: appconfig.auth.refresh_token_expiresin,
        }
      );

      const tokens = { token, refreshToken };
      // save access token
      await super.saveTokens(tokens, session.user);
      // save fcm token
      if (session.firebaseToken !== "") {
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
        ? customResourceResponse.success.message
        : customResourceResponse.recordNotFound.message,
      statusCode: data
        ? customResourceResponse.success.statusCode
        : customResourceResponse.recordNotFound.statusCode,
      data: data || null,
    };
    return response;
  }

  // Utility method to handle repetitive try-catch and response preparation
  handleRepositoryCall = async (repositoryMethod, ...params) => {
    try {
      const result = await repositoryMethod(...params);
      return this.prepareResponse(result);
    } catch (err) {
      // Log error for debugging in development
      if (process.env.NODE_ENV !== "production") {
        this.log(
          `Error occurred while executing repository method:${err}`,
          " error"
        );
      }
      throw {
        message:
          err.message ||
          "An error occurred while interacting with the database",
        stack: err.stack,
      };
    }
  };
}

export default BaseService;
