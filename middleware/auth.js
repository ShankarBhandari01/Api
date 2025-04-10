const jwt = require("jsonwebtoken");
const _ = require("lodash");
const config = require("../config/appconfig");
const RequestHandler = require("../utils/RequestHandler");
const BaseService = require("../services/BaseService");
const dbConnection = require("../database/ConnectionManager");

const requestHandler = new RequestHandler();

function getTokenFromHeader(req) {
  const authorization = req.headers.authorization || "";
  const parts = authorization.split(" ");

  if (parts.length === 2 && (parts[0] === "Bearer" || parts[0] === "Token")) {
    return parts[1];
  }

  return null;
}

function handleAuthorizationError(res) {
  requestHandler.throwError(
    res,
    401,
    "Unauthorized",
    "Not Authorized to access this resource!"
  )();
}

async function verifyTokenInDatabase(req,token) {
  const connection = await dbConnection.getConnection(
    req.session.envConfig.database
  );
  const baseService = new BaseService(connection);

  const storedToken = await baseService.getCurrentUserToken(token);
  if (!storedToken) {
    return { isValid: false, message: "Invalid or expired token" };
  }
  return { isValid: true, DatabaseToken: storedToken };
}

function verifyJwtToken(token, secret, req, res, next) {
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return requestHandler.throwError(
        res,
        401,
        "Unauthorized",
        "Please provide a valid token, your token might be expired"
      )();
    }

    req.session.user = decoded.sanitizedSession;
    next();
  });
}

async function verifyAuthToken(req, res, next) {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      return handleAuthorizationError(res);
    }

    // Check if token exists in the database
    const { isValid, message } = await verifyTokenInDatabase(req, token);
    if (!isValid) {
      return res.status(401).json({ message });
    }
    // Verifies the token's secret and expiration
    verifyJwtToken(token, config.auth.jwt_secret, req, res, next);
  } catch (err) {
    requestHandler.sendError(req, res, err);
  }
}

async function verifyRefreshToken(req, res, next) {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      return handleAuthorizationError(res);
    }

    // Check if refresh token exists in the database
    const { isValid, message, DatabaseToken } = await verifyTokenInDatabase(
      req,
      token
    );
    if (!isValid) {
      return res.status(401).json({ code: 401, message });
    }
    // verify the token date
    const now = new Date();
    if (now > new Date(DatabaseToken.refreshExpiresAt)) {
      return res
        .status(401)
        .json({ code: 401, message: "Refresh token expired" });
    }
    // Verifies the refresh token's secret and expiration
    verifyJwtToken(token, config.auth.refresh_token_secret, req, res, next);
  } catch (err) {
    requestHandler.sendError(req, res, err);
  }
}

module.exports = {
  getJwtToken: getTokenFromHeader,
  isAuthenticated: verifyAuthToken,
  isRefreshTokenAuthenticated: verifyRefreshToken,
};
