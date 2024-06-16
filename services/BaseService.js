const _ = require("lodash");
const RequestHandler = require("../utils/RequestHandler");
const Logger = require("../utils/logger");
const jwt = require("jsonwebtoken");
const config = require("../config/appconfig");
const logger = new Logger();
const errHandler = new RequestHandler(logger);
class BaseService {

   async assignToken(user) {
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
}
module.exports = BaseService;
