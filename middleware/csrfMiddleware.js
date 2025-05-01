import csrf from "csurf";
const apiVersion = process.env.API_VERSION;

// Middleware to send CSRF token
export const csrfTokenMiddleware = (req, res, next) => {
  // This route can be used by the client-side to fetch the CSRF token
  if (req.method === "GET" && req.url === `/api/${apiVersion}/csrf-token`) {
    return res.json({ csrfToken: req.csrfToken() });
  }
  next();
};

// CSRF protection middleware (For POST/PUT/DELETE requests)
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
});


