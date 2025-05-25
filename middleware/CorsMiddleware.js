import cors from "cors";
import { URL } from "url";

export default () => {
  let cachedWhitelist = null;
  let lastFetched = 0;

  const WHITELIST_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

  // Normalize URLs to compare origins better
  const normalizeOrigin = (origin) => {
    try {
      const url = new URL(origin);
      return url.origin.toLowerCase(); // scheme + host + port (if any)
    } catch {
      return origin;
    }
  };

  return async (req, res, next) => {
    try {
      const isDev =
        process.env.NODE_ENV === "test" ||
        process.env.NODE_ENV === "development";

      const adminService = req.scope.resolve("adminService");

      // Refresh whitelist if cache expired or missing
      const now = Date.now();
      if (!cachedWhitelist || now - lastFetched > WHITELIST_CACHE_TTL) {
        const whitelist = await adminService.getCorsWhitelist();
        cachedWhitelist = Array.isArray(whitelist)
          ? whitelist.map(normalizeOrigin)
          : [];
        lastFetched = now;
      }

      const origin = req.header("Origin");
      const normalizedOrigin = normalizeOrigin(origin);

      const corsOptions = {
        origin: function (originHeader, callback) {
          // Allow dev or no origin (curl, server-side requests)
          if (isDev || !originHeader) return callback(null, true);

          if (cachedWhitelist.includes(normalizeOrigin(originHeader))) {
            callback(null, true);
          } else {
            callback(new Error(`Not allowed by CORS: ${originHeader}`), false);
          }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        optionsSuccessStatus: 204, // 204 is better for preflight success
      };

      cors(corsOptions)(req, res, next);
    } catch (err) {
      console.error("CORS Middleware Error:", err);
      res
        .status(500)
        .json({ error: "Internal Server Error in CORS middleware" });
    }
  };
};
