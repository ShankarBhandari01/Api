const jwt = require("jsonwebtoken");
const _ = require("lodash");
const config = require("../config/appconfig");
const RequestHandler = require("../utils/RequestHandler");
const Logger = require("../utils/logger");
const BaseService = require("../services/BaseService");

const baseService = new BaseService();
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
function getTokenFromHeader(req) {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Token") ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }

  return null;
}

async function verifyToken(req, res, next) {
  try {
    if (_.isUndefined(req.headers.authorization)) {
      requestHandler.throwError(
        res,
        401,
        "Unauthorized",
        "Not Authorized to access this resource!"
      )();
    }
    const Bearer = req.headers.authorization.split(" ")[0];

    if (!Bearer || Bearer !== "Bearer") {
      requestHandler.throwError(
        res,
        401,
        "Unauthorized",
        "Not Authorized to access this resource!"
      )();
    }

    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      requestHandler.throwError(
        res,
        401,
        "Unauthorized",
        "Not Authorized to access this resource!"
      )();
    }
    // Check if the token exists in the database
    const storedToken = await baseService.getCurrentUserToken(token);
    // validation of token in database
    if (!storedToken)
      return res.status(401).json({ message: "Invalid or expired token" });

    // verifies secret and checks exp
    jwt.verify(token, config.auth.jwt_secret, (err, decoded) => {
      if (err) {
        requestHandler.throwError(
          res,
          401,
          "Unauthorized",
          "please provide a vaid token ,your token might be expired"
        )();
      }
      req.decoded = decoded;
      next();
    });
  } catch (err) {
    requestHandler.sendError(req, res, err);
  }
}

module.exports = {
  getJwtToken: getTokenFromHeader,
  isAuthunticated: verifyToken,
};
