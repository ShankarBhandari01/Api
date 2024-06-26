const jwt = require("jsonwebtoken");
const config = require("../config/appconfig");
const BaseRepo = require("../repo/BaseRepo");

const baseRepo = new BaseRepo();
class BaseService {
  assignToken(user) {
    let tokens = {};
    try {
      // Set the options for token generation
      const options = {
        expiresIn: config.auth.jwt_expiresin, // Token will expire in 1 day
        algorithm: "HS256",
        issuer: "Myapp",
        subject: "",
        audience: "",
      };
      const token = jwt.sign({ user }, config.auth.jwt_secret, options);
      const refreshToken = jwt.sign(
        { user },
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
