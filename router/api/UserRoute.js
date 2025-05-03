import { Router } from "express";
const router = Router();
import UserController from "../../controllers/UserController.js";
import { validateUser, validateLogin } from "../../middleware/DataValidator.js";
import {
  isRefreshTokenAuthenticated,
  isAuthenticated,
} from "../../middleware/auth.js";
import fileupload from "../../middleware/fileUploadMiddleware.js";
import { languageMiddleware } from "../../middleware/languageMiddleware.js";
import { authLimiter } from "../../middleware/RequestRateLimiter.js";


// User Signup route
router.post("/signup", fileupload.uploadImage, validateUser, (req, res) =>
  new UserController(req, res).signup()
);

// User Login route
router.post("/login", validateLogin, authLimiter, (req, res) =>
  new UserController(req, res).login()
);
// User Refresh Token route
router.post(
  "/token/refresh",
  languageMiddleware,
  isRefreshTokenAuthenticated,
  (req, res) => new UserController(req, res).refreshToken()
);

// User Logout route
router.post("/logout", languageMiddleware, isAuthenticated, (req, res) =>
  new UserController(req, res).logout()
);

export default router;
