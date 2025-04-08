// middlewares/cors.middleware.js
const cors = require("cors");
const config = require('../config/appconfig')

const whitelist = config.app.corsPolicies?.split(',') || [];

const corsOptions = {
  origin: function (origin, callback) {
    if (process.env.NODE_ENV === "test") {
      callback(null, true); // Allow all origins in test environment
    } else {
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

module.exports = cors(corsOptions);
