const accessToken = require("../models/Token");
const userlog = require("../models/UserloginLog");
const Logger = require("../utils/logger");
const { DatabaseError } = require("../utils/errors");
const FcmToken = require("../models/FcmToken");

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
        `Token successfully saved or updated for user: ${user._id}`,
        "info"
      );
    } catch (error) {
      this.log(`Error saving or updating token:${error}`, " error");
      throw new Error(`Error saving or updating token:${error}`);
    }
  }
  getFcmTokenFromDatabase = async () => {
    try {
      const fcmTokenTable = FcmToken(this.connection);
      return await fcmTokenTable.find().lean();
    } catch (error) {
      this.log(`FCM token error:${err}`, "error");
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

      this.log("FCM Token registered successfully", "info");
    } catch (err) {
      this.log(`FCM token error:${err}`, "error");
      await Promise.reject(err);
    }
  };
  async insertUserLog(log) {
    try {
      return log.save();
    } catch (error) {
      this.log(`Error while inserting user log ${error}`, "error");
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
      this.log(`Error uploading image: ${err.message}`, "error");
      throw new DatabaseError("Error uploading image: " + err.message);
    }
  }

  uploadImage = async (image, session) => {
    try {
      return await image.save({ session });
    } catch (err) {
      this.log(`Error uploading image: ${err.message}`, "error");
      throw new DatabaseError("Error uploading image: " + err.message);
    }
  };

  // Utility function to log and throw errors
  logAndThrowError = (message, err) => {
    this.log(message, "error");
    throw new DatabaseError(`${message}: ${err.message}`);
  };
}

module.exports = BaseRepository;
