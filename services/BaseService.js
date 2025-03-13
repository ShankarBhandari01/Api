const jwt = require("jsonwebtoken");
const config = require("../config/appconfig");
const BaseRepo = require("../repo/BaseRepo");
const lodash = require("lodash");

const baseRepo = new BaseRepo();
class BaseService {
  assignToken(user, session) {
    let tokens = {};
    try {
      // Set the options for token generation
      const options = {
        expiresIn: config.auth.jwt_expiresin, // Token will expire in 1 day
        algorithm: "HS256",
        issuer: "restaurant-pos-api",
        subject: "",
        audience: "",
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
      const sanitizedSession = lodash.omit(sessionuser.toObject(), ["profile"]);
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
    } catch (err) {
      return Promise.reject(err);
    }
    return tokens;
  }

  async doRecording(log) {
    try {
      const result = await baseRepo.insertUserlog(log);
      return result._id;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async updateLogStatus(msg, logId) {
    try {
      const result = await baseRepo.updateLogMsg(msg, logId);
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
module.exports = BaseService;
