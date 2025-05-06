import { Router } from "express";
import { validateUser, validateLogin } from "../../middleware/DataValidator.js";
import {
  isRefreshTokenAuthenticated,
  isAuthenticated,
} from "../../middleware/auth.js";
import fileupload from "../../middleware/fileUploadMiddleware.js";
import { authLimiter } from "../../middleware/RequestRateLimiter.js";

const router = Router();

// User Signup route
router.post(
  "/signup",
  fileupload.uploadImage,
  validateUser,
  async (req, res, next) => {
    try {
      const controller = req.scope.resolve("userController");
      await controller.signup();
    } catch (err) {
      next(err);
    }
  }
);

// User Login route
router.post("/login", validateLogin, authLimiter, async (req, res, next) => {
  try {
    const controller = req.scope.resolve("userController");
    await controller.login();
  } catch (err) {
    next(err);
  }
});
// User Refresh Token route
router.post(
  "/token/refresh",
  isRefreshTokenAuthenticated,
  async (req, res, next) => {
    try {
      const controller = req.scope.resolve("userController");
      await controller.refreshToken();
    } catch (err) {
      next(err);
    }
  }
);

// User Logout route
router.post("/logout", isAuthenticated, async (req, res, next) => {
  try {
    const controller = req.scope.resolve("userController");
    await controller.logout();
  } catch (err) {
    next(err);
  }
});

router.get("/getAllUsers", isAuthenticated, async (req, res, next) => {
  try {
    const controller = req.scope.resolve("userController");
    await controller.getAllUsers();
  } catch (err) {
    next(err);
  }
});
router.get("/getUserById/:id", isAuthenticated, async (req, res, next) => {
  try {
    const controller = req.scope.resolve("userController");
    await controller.getUserById();
  } catch (err) {
    next(err);
  }
});
// update user
router.put(
  "/updateUser/:id",
  isAuthenticated,
  fileupload.uploadImage,
  async (req, res, next) => {
    try {
      const controller = req.scope.resolve("userController");
      await controller.updateUser();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
