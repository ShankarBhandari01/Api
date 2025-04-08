// middlewares/cors.middleware.js
const cors = require('cors');

const whitelist = ['http://localhost:3001','http://127.0.0.1:3000', 'https://restaurantfin.vercel.app/'];

const corsOptions = {
  origin: function (origin, callback) {
    if (process.env.NODE_ENV === 'test') {
      callback(null, true); // Allow all origins in test environment
    } else {
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

module.exports = cors(corsOptions);
