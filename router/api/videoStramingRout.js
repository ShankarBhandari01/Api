const express = require('express');
const router = express.Router();

const controller = require('../../controllers/videoStremingController'); 

router.get('/videoplayer',controller.StartStreaming)


module.exports = router;