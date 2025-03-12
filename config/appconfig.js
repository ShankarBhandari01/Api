require("dotenv").config();
const path = require("path");

// config.js
module.exports = {
  app: {
    port: process.env.DEV_APP_PORT || 3000,
    appName: process.env.APP_NAME || "restaurant-pos-api",
    env: process.env.NODE_ENV || "development",
  },
  db: {
    port: process.env.DB_PORT || 27017,
    database: process.env.DB_NAME || "restaurant-pos-api",
    password: process.env.DB_PASS || "bhandari12345shankar",
    username: process.env.DB_USER || "shankarbhandari",
    host: process.env.DB_HOST || "mongodb://0.0.0.0:27017/Mydatabase",
    dialect: "mongodb",
    logging: true,
  },
  winiston: {
    logpath: "/myapp/logs/",
  },
  auth: {
    jwt_secret: process.env.JWT_SECRET || "VmVyeVBvd2VyZnVsbFNlY3JldA==",
    jwt_expiresin: process.env.JWT_EXPIRES_IN || "1d",
    saltRounds: process.env.SALT_ROUND || 10,
    refresh_token_secret:
      process.env.REFRESH_TOKEN_SECRET || "VmVyeVBvd2VyZnVsbFNlY3JldA==",
    refresh_token_expiresin: process.env.REFRESH_TOKEN_EXPIRES_IN || "2d", // 2 days
  },
  sendgrid: {
    api_key: process.env.SEND_GRID_API_KEY,
    api_user: process.env.USERNAME,
    from_email: process.env.FROM_EMAIL || "iamshankarbhandari@gmail.com",
  },
  file: {
    uploadDir: path.join(__dirname, "../public/images"),
    ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES || ["image/jpeg", "image/png", "image/gif"],
  },
};
