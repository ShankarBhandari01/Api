import { Router } from "express";
import UserController from "../../controllers/UserController.js";
import { validateUser, validateLogin } from "../../middleware/DataValidator.js";
import {
  isRefreshTokenAuthenticated,
  isAuthenticated,
} from "../../middleware/auth.js";
import fileupload from "../../middleware/fileUploadMiddleware.js";
import { authLimiter } from "../../middleware/RequestRateLimiter.js";

const router = Router();

// User Signup route
router.post("/signup", fileupload.uploadImage, validateUser, (req, res) =>
  new UserController(req, res).signup()
);

// User Login route
router.post("/login", validateLogin, authLimiter, (req, res) =>
  new UserController(req, res).login()
);
// User Refresh Token route
router.post("/token/refresh", isRefreshTokenAuthenticated, (req, res) =>
  new UserController(req, res).refreshToken()
);

// User Logout route
router.post("/logout", isAuthenticated, (req, res) =>
  new UserController(req, res).logout()
);

router.get("/getAllUsers", isAuthenticated, (req, res) =>
  new UserController(req, res).getAllUsers()
);
router.get("/getUserById/:id", isAuthenticated, (req, res) =>
  new UserController(req, res).getUserById()
);
// update user
router.put(
  "/updateUser/:id",
  isAuthenticated,
  fileupload.uploadImage,
  (req, res) => new UserController(req, res).updateUser()
);

export default router;
