const accessToken = require("../model/Token");
const userlog = require("../model/UserloginLog");
const RequestHandler = require("../utils/RequestHandler");
const Logger = require("../utils/logger");

class BaseRepo {
  saveTokens = async (createdToken, user) => {
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
  };

  insertUserLog = async (log) => {
    return userlog.create(log);
  };

  updateLogMsg = async (msg, id) => {
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
  };
  // reterive user token
  getCurrentUserToken = async (token) => {
    return accessToken.findOne({ token: token }).lean();
  };

  logout = async (userId) => {
    try {
      return accessToken.findOneAndDelete({ userId }).select(false);
    } catch (error) {
      Promise.reject(error);
    }
  };
}
module.exports = BaseRepo;
