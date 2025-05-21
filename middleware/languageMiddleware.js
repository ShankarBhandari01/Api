// middleware/languageMiddleware.js
import config from "../config/config.json" with { type: "json" };

export default function createLanguageMiddleware() {
  return function languageMiddleware(req, res, next) {
    if (!req.session) {
      return next(new Error("Session middleware must be initialized before languageMiddleware"));
    }

    req.session.lang = req.query.lang || "en";
    req.session.envConfig = config[process.env.NODE_ENV || "development"];
    next();
  };
}
