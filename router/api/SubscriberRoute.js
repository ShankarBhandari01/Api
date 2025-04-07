const express = require("express");
const router = express.Router();
const {languageMiddleware} = require("../../middleware/languageMiddleware");
const {SubscriberController} = require('../../controllers/SubscriberController')
const auth = require("../../middleware/auth");


// Endpoint to subscribe user
router.post("/subscribe", languageMiddleware, async (req, res, next) => {
    try {
        const controller = new SubscriberController(req, res);
        await controller.subscribe()
    } catch (error) {
        next(error);
    }
});

// Endpoint to unsubscribe user
router.post("/unsubscribe", languageMiddleware, async (req, res) => {
    try {
        const controller = new SubscriberController(req, res);
        await controller.unsubscribe()
    } catch (error) {
        next(error);
    }
});
// Endpoint to send marketing emails to all subscribers
router.post("/sendMarketingEmail", languageMiddleware, auth.isAuthunticated, async (req, res) => {
    const {subject, message} = req.body;
    try {

    } catch (error) {
        next(error);
    }
});
module.exports = router;
