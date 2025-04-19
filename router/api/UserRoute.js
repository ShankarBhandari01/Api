const express = require("express");
const router = express.Router();

const UserController = require("../../controllers/UserController");
const {
  validateUser,
  validateLogin,
} = require("../../middleware/DataValidator");

const auth = require("../../middleware/auth");
const fileupload = require("../../middleware/fileUploadMiddleware");
const { languageMiddleware } = require("../../middleware/languageMiddleware");

// User Signup route
router.post("/signup", fileupload.uploadImage, validateUser, (req, res) =>
  new UserController(req, res).signup()
);

// User Login route
router.post("/login", validateLogin, (req, res) =>
  new UserController(req, res).login()
);

router.post(
  "/token/refresh",
  languageMiddleware,
  auth.isRefreshTokenAuthenticated,
  (req, res) => new UserController(req, res).refreshToken()
);

// User Logout route
router.post("/logout", languageMiddleware, auth.isAuthenticated, (req, res) =>
  new UserController(req, res).logout()
);

module.exports = router;
