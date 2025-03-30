const express = require("express");
const router = express.Router();
const controller = require("../../controllers/UserController"); //controller for sign up route
const {
  validateUser,
  validateLogin,
} = require("../../middleware/DataValidator"); // middlerware for sign up validator
const auth = require("../../middleware/auth"); //middleware for varifying user
// middleware for image upload
const fileupload = require("../../middleware/fileUploadMiddleware");

const {languageMiddleware} = require("../../middleware/languageMiddleware");
//User Signup route
router.post(
  "/signup",
  languageMiddleware,
  fileupload.uploadImage,
  validateUser,
  controller.signup
);
//user Login route
router.post("/login", languageMiddleware, validateLogin, controller.login);
// logout route
router.post(
  "/logout",
  languageMiddleware,
  auth.isAuthunticated,
  controller.logout
);
module.exports = router;
