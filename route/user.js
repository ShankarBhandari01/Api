const express = require('express');
const router = express.Router();
const controller = require('../controllers/UserController'); //controller for sign up route
const {uservalidator}= require('../middleware/UserValidator')// middlerware for sign up validator
//User Signup route 
router.post("/Signup",uservalidator, controller.Signup)
//user Login route
router.post("/login",controller.login);

module.exports = router;