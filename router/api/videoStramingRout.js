const express = require("express");
const router = express.Router();

const controller = require("../../controllers/videoStremingController");
const {languageMiddleware} = require("../../middleware/languageMiddleware");

router.get("/videoplayer", languageMiddleware, controller.StartStreaming);

module.exports = router;
