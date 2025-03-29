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
//User Signup route
router.post("/signup", fileupload.uploadImage, validateUser, controller.signup);
//user Login route
router.post("/login", validateLogin, controller.login);
// logout route
router.post("/logout", auth.isAuthunticated, controller.logout);
module.exports = router;
