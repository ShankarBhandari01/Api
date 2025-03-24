const accessToken = require("../model/Token");
const userlog = require("../model/UserloginLog");
const RequestHandler = require("../utils/RequestHandler");
const Logger = require("../utils/logger");

class BaseRepo {
  saveTokens = async (createdtoken, user) => {
    const { token, refreshToken } = createdtoken;
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

  insertUserlog = async (log) => {
    return await userlog.create(log);
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
    return await userlog.updateOne(filter, update);
  };
  // reterive user token
  getCurrentUserToken = async (token) => {
    return await accessToken.findOne({ token: token });
  };
}
module.exports = BaseRepo;
