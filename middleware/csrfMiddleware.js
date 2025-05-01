import csrf from "csurf";

const apiVersion = process.env.API_VERSION || "v1"; // default fallback

// CSRF protection middleware for POST/PUT/DELETE
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  },
});

// Middleware to send CSRF token to client
export const csrfTokenMiddleware = (req, res, next) => {
  if (
    req.method === "GET" &&
    req.originalUrl === `/api/${apiVersion}/csrf-token`
  ) {
    try {
      return res.status(200).json({ csrfToken: req.csrfToken() });
    } catch (err) {
      return res.status(403).json({ error: "Unable to generate CSRF token." });
    }
  }
  next();
};
