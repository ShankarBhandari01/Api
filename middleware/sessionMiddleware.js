// session/sessionMiddleware.js
import session from "express-session";
import { RedisStore } from "connect-redis";

export default function createSessionMiddleware(redisClient) {
  return session({
    store: new RedisStore({ client: redisClient, prefix: "sess:" }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  });
}
