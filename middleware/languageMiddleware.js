import config from '../config/config.json' with { type: 'json' };
export function languageMiddleware(req, res, next) {
  req.session.lang = "en";
  if (req.query.lang) {
    req.session.lang = req.query.lang;
  }
  req.session.envConfig = config[process.env.NODE_ENV || "development"];
  next();
}
