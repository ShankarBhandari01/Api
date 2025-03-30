exports.languageMiddleware = (req, res, next) => {
  req.session.lang = "en"; // Default to English
  if (req.query.lang) {
    req.session.lang = req.query.lang;
  }
  next();
};
