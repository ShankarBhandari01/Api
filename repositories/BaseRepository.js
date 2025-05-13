import accessToken from "../models/Token.js";
import userlog from "../models/UserloginLog.js";
import Logger from "../utils/logger.js";
import { DatabaseError } from "../utils/errors.js";
import FcmToken from "../models/FcmToken.js";
import imageModel from "../models/Image.js";

class BaseRepository extends Logger {
  constructor(connection) {
    super();
    this.connection = connection;
  }
  async saveTokens(createdToken, user) {
    const { token, refreshToken } = createdToken;
    try {
      const tokentable = accessToken(this.connection);
      const existingToken = await tokentable.findOne({ userId: user._id });
      if (existingToken) {
        await tokentable.findOneAndUpdate(
          { userId: user._id },
          {
            token: token,
            refreshToken: refreshToken,
            refreshExpiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 days expiry
          },
          {
            new: true, // Return the updated document
          }
        );
      } else {
        // Create a new document for a new user login
        await tokentable.create({
          userId: user._id,
          token: token,
          refreshToken: refreshToken,
          refreshExpiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 days expiry
        });
      }
      super.log(
        `[Api] Token successfully saved or updated for user: ${user._id}`,
        "info"
      );
    } catch (error) {
      this.log(`[Api] Error saving or updating token:${error}`, " error");
      throw new Error(`Error saving or updating token:${error}`);
    }
  }
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

  async logout(userId) {
    try {
      const tokentable = accessToken(this.connection);
      return tokentable.findOneAndDelete({ userId }).select(false);
    } catch (error) {
      this.log(`[Api] Error uploading image: ${err.message}`, "error");
      throw new DatabaseError("Error uploading image: " + err.message);
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
}

export default BaseRepository;
