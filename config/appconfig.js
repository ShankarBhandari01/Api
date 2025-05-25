import dotenv from "dotenv";
dotenv.config();
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = {
  port: process.env.DEV_APP_PORT || 3000,
  appName: process.env.APP_NAME || "restaurant-pos-api",
  env: process.env.NODE_ENV || "development",
  corsPolicies: process.env.CORS_WHITELIST,
};

const jwtVerifyOptions = {
  algorithms: [process.env.JWT_ALGORITHM],
  issuer: process.env.JWT_ISSUER,
  subject: process.env.JWT_SUBJECT,
  audience: process.env.JWT_AUDIENCE,
};
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || "1d", // 1 day
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "2d", // 2 days
  saltRounds: process.env.SALT_ROUND || 10,
  algorithms: [process.env.JWT_ALGORITHM],
  issuer: process.env.JWT_ISSUER,
  subject: process.env.JWT_SUBJECT,
  audience: process.env.JWT_AUDIENCE,
};
const agenda = {
  CAMPAIGN_EMAIL_SCHEDULE: process.env.CAMPAIGN_EMAIL_SCHEDULE || "1 day",
  EXPIRE_CAMPAIGN_SCHEDULE: process.env.EXPIRE_CAMPAIGN_SCHEDULE || "0 0 * * *",
};
const db = {
  port: process.env.DB_PORT || 27017,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  username: process.env.DB_USER,
  host: process.env.DB_HOST,
  dialect: "mongodb",
  logging: true,
};
const redis = {
  host: process.env.REDIS_HOST || "redis://localhost:6379",
};
const winiston = {
  logpath: "/myapp/logs/",
};
const sendgrid = {
  api_key: process.env.SEND_GRID_API_KEY,
  api_user: process.env.USERNAME,
  from_email: process.env.FROM_EMAIL,
  email_pass: process.env.EMAIL_PASS,
};
const file = {
  uploadDir: join(__dirname, "../public/images"),
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES
    ? process.env.ALLOWED_FILE_TYPES.split(",")
    : ["image/jpeg", "image/png", "image/gif", "image/svg+xml"],
};

// Export the entire config as a default export
export default {
  app,
  agenda,
  db,
  winiston,
  sendgrid,
  file,
  redis,
  jwtConfig,
  jwtVerifyOptions,
};
