const accessToken = require("../model/Token");
const userlog = require("../model/UserloginLog");
const RequestHandler = require("../utils/RequestHandler");
const Logger = require("../utils/logger");
const logger = new Logger();
class BaseRepo {
  async saveTokens(createdToken, user) {
    const { token, refreshToken } = createdToken;
    await accessToken.findOneAndUpdate(
      { userId: user.id },
      {
        token: token,
        refreshToken: refreshToken,
        refreshExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
      },
      { upsert: true, new: true }
    );
  }

  async insertUserLog(log) {
    try {
      return userlog.create(log);
    } catch (error) {
      logger.error(`Error while inserting user log ${error}`);
      Promise.reject(error);
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

    // Update the document
    return userlog.updateOne(filter, update);
  }
  // reterive user token
  async getCurrentUserToken(token) {
    return accessToken.findOne({ token: token }).lean();
  }

  async logout(userId) {
    try {
      return accessToken.findOneAndDelete({ userId }).select(false);
    } catch (error) {
      Promise.reject(error);
    }
  }

  uploadImage = async (image, session) => {
    try {
      return await image.save({ session });
    } catch (err) {
      logger.log(`Error uploading image: ${err.message}`, "error");
      throw new DatabaseError("Error uploading image: " + err.message);
    }
  };
}
module.exports = BaseRepo;
