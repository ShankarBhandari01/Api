import accessToken from "../models/Token.js";
import userlog from "../models/UserloginLog.js";
import sharp from "sharp";
import Logger from "../utils/logger.js";
import { DatabaseError } from "../utils/errors.js";
import FcmToken from "../models/FcmToken.js";
import imageModel from "../models/Image.js";
import appconfig from "../config/appconfig.js";

class BaseRepository extends Logger {
  constructor(connection) {
    super();
    this.connection = connection;
  }

  /**
   * save  token details
   * @param {Object} createdToken - { token, refreshToken }
   * @param {Object} user - user object (must contain _id)
   * @param {Object} deviceInfo - information about the device from which user is trying to  login 
   */
  async saveTokens(createdToken, user, deviceInfo) {
    try {
      // model for access token
      const tokentable = accessToken(this.connection);
      //query to find the existing token 
      var query = {
        userId: user._id,
        "deviceInfo.platform": deviceInfo.platform,
        "deviceInfo.deviceId": deviceInfo.deviceId
      }
      // Check if a token already exists for the user
      // const existingToken = await tokentable.findOne(query);

      // If a token exists, update it; otherwise, create a new one
      const tokenData = this.generateTokenDetails(createdToken, user, deviceInfo);

      // If the token already exists, update it or insert 
      await tokentable.findOneAndUpdate(query,
        {
          $set: tokenData
        },
        {
          new: true, // Return the updated document,
          runValidators: true, // Ensure validation rules are applied
          upsert: true // insert if not 
        }
      );

      super.log(
        `[Api] Token successfully saved or updated for user: ${user._id}`,
        "info"
      );
    } catch (error) {
      this.log(`[Api] Error saving or updating token:${error}`, " error");
      throw new Error(`Error saving or updating token:${error}`);
    }
  }

  /**
   * Generate token details
   * @param {Object} createdToken - { token, refreshToken }
   * @param {Object} user - user object (must contain _id)
   * @returns {Object} tokenDetails
   */
  generateTokenDetails = (createdToken, user, deviceInfo) => {
    const { token, refreshToken } = createdToken;
    const expiredIn = parseInt(appconfig.jwtConfig.refreshTokenExpiresIn.split("d")[0], 10)
    return {
      userId: user._id,
      token: token,
      refreshToken: refreshToken,
      refreshExpiresAt: new Date(Date.now() + expiredIn * 24 * 60 * 60 * 1000),
      deviceInfo
    };
  };

  getFcmTokenFromDatabase = async () => {
    try {
      const fcmTokenTable = FcmToken(this.connection);
      return await fcmTokenTable.find().lean();
    } catch (error) {
      this.log(`[Api] FCM token error:${err}`, "error");
    }
  };
  // save fcm token
  saveFcmToken = async (session) => {
    try {
      const fcmTokenTable = FcmToken(this.connection);
      const userId = session.user._id; // get user id
      const fcmToken = session.firebaseToken.fcmToken;

      await fcmTokenTable.findOneAndUpdate(
        { token: fcmToken },
        {
          $set: {
            userId: userId, // in case userId has changed
            deviceInfo: session.firebaseToken.deviceInfo || {},
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );

      this.log("[Api] FCM Token registered successfully", "info");
    } catch (err) {
      this.log(`[Api] FCM token error:${err}`, "error");
      await Promise.resolve(err);
    }
  };
  async insertUserLog(log) {
    try {
      return log.save();
    } catch (error) {
      this.log(`[Api] Error while inserting user log ${error}`, "error");
      await Promise.reject(error);
    }
  }
  async updateLogMsg(msg, id) {
    // Define the filter query to find the document to update
    const filter = { _id: id };

    // Define the update operation
    const update = {
      $set: {
        statusMsg: msg,
      },
    };

    const userLogTable = userlog(this.connection);
    // Update the document
    return userLogTable.updateOne(filter, update);
  }

  async getCurrentUserToken(token) {
    try {
      const tokentable = accessToken(this.connection);
      return tokentable
        .findOne({
          $or: [{ token: token }, { refreshToken: token }],
        })
        .lean();
    } catch (error) {
      await Promise.reject(error);
    }
  }

  async getTokenByUserIdAndDelete(userId) {
    try {
      const tokentable = accessToken(this.connection);
      return tokentable.findOneAndDelete({ userId }).lean();
    } catch (error) {
      this.logAndThrowError(error.message, error);
    }
  }

  uploadImage = async (image, session) => {
    try {
      return await image.save({ session });
    } catch (error) {
      this.logAndThrowError(error.message, error);
    }
  };

  // Utility function to handle image upload logic
  handleImageUploadToDatabase = async (imageData, session) => {
    const ImageModel = imageModel(this.connection);
    const newImage = new ImageModel();
    if (imageData && imageData.length > 0) {
      const image = imageData[0];
      newImage.url = image.url;
      newImage.filename = image.originalname;
      newImage.contentType = image.mimetype;
      newImage.imageData = image.buffer;
      return await this.uploadImage(newImage, session);
    }
    return null;
  };

  // Utility function to log and throw errors
  logAndThrowError = (message, err) => {
    this.log(`[Api] ${message.message}`, "error");
    throw new DatabaseError(`${message}: ${err.message}`);
  };

  // Utility to safely convert image to base64
  formatProfileImage(image) {
    if (image && image.imageData && image.contentType) {
      return `data:${image.contentType};base64,${image.imageData.toString(
        "base64"
      )}`;
    }
    return null;
  }
  // Utility function to validate image dimensions
  async validateImageDimensions(imageBuffer) {
    try {
      if (!imageBuffer || !imageBuffer[0] || !imageBuffer[0].buffer) {
        this.log("Image buffer is empty or invalid", "error");
        return { valid: false, message: "Image buffer is empty or invalid" };
      }

      const metadata = await sharp(imageBuffer[0].buffer).metadata();

      if (metadata.width >= 600 && metadata.height >= 600) {
        return { valid: true, message: "Image dimensions are valid" };
      } else {
        const msg = `Image dimensions too small: ${metadata.width}x${metadata.height}. Minimum required is 600x600 px.`;
        this.log(msg, "error");
        return { valid: false, message: msg };
      }
    } catch (error) {
      const msg = `Error reading image metadata: ${error.message}`;
      this.log(msg, "error");
      return { valid: false, message: msg };
    }
  }
}

export default BaseRepository;
