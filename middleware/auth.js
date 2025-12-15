import pkg from "jsonwebtoken";
const { verify } = pkg;
import _ from "lodash";
import appconfig from "../config/appconfig.js";
import RequestHandler from "../utils/RequestHandler.js";
import BaseService from "../services/BaseService.js";

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

async function verifyTokenInDatabase(req, token) {
  // only connection is in the scope variable
  const connection = req.scope.resolve("connection");
  // get instance from di
  const redis = req.scope.resolve("redisSocketService");
  // cache key
  const cacheKey = `auth:token:${token}`;

  // Try fetching token info from Redis cache
  const cachedTokenData = await redis.getCacheValue(cacheKey);
  if (cachedTokenData) {
    return { isValid: true, DatabaseToken: cachedTokenData };
  }

  // Fallback to database if not found in cache
  const baseService = new BaseService(connection);
  const storedToken = await baseService.getCurrentUserToken(token);

  if (!storedToken) {
    return { isValid: false, message: "Invalid or expired token" };
  }

  // Cache the token data for future use (e.g., 15m)
  await redis.setCacheValue(cacheKey, storedToken, 900);

  return { isValid: true, DatabaseToken: storedToken };
}

function verifyJwtToken(token, secret, options, req, res, next) {
  try {
    verify(token, secret, options, (err, decoded) => {
      if (err) {
        return requestHandler.throwError(
          res,
          401,
          "Unauthorized",
          `Invalid or expired token ${err.message}`
        )(); // This throws,
      }

      // Sanity check if sanitizedSession exists
      if (!decoded?.sanitizedSession) {
        return requestHandler.throwError(
          res,
          403,
          "Forbidden",
          "Session data missing in token"
        )();
      }

      req.session.user = decoded.sanitizedSession;
      next();
    });
  } catch (error) {
    requestHandler.sendError(req, res, error);
  }
}

async function verifyAuthToken(req, res, next) {
  try {
     if (
       process.env.NODE_ENV === "test" ||
        process.env.NODE_ENV === "development"
      ) {
        return next();
     }
    const token = getTokenFromHeader(req);

    if (!token) {
      return handleAuthorizationError(res);
    }

    // Check if token exists in the database
    const { isValid, message } = await verifyTokenInDatabase(req, token);
    if (!isValid) {
      return res.status(401).json({ message });
    }
    // verify jwt
    verifyJwtToken(
      token,
      appconfig.jwtConfig.secret,
      appconfig.jwtVerifyOptions,
      req,
      res,
      next
    );
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

    // Clone the original options
    const options = { ...appconfig.jwtVerifyOptions };
    // Change the subject to "refresh_token"
    options.subject = "refresh_token";

    verifyJwtToken(
      token,
      appconfig.jwtConfig.refreshTokenSecret,
      options,
      req,
      res,
      next
    );

  } catch (err) {
    requestHandler.sendError(req, res, err);
  }
}

export const getJwtToken = getTokenFromHeader;
export const isAuthenticated = verifyAuthToken;
export const isRefreshTokenAuthenticated = verifyRefreshToken;
