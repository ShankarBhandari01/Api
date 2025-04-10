const express = require("express");
const router = express.Router();
const { languageMiddleware } = require("../../middleware/languageMiddleware");
const {
  SubscriberController,
} = require("../../controllers/SubscriberController");
const auth = require("../../middleware/auth");

// Endpoint to subscribe user
router.post("/subscribe", languageMiddleware, (req, res) =>
  new SubscriberController(req, res).subscribe()
);

// Endpoint to unsubscribe user
router.post("/unsubscribe", languageMiddleware, (req, res) =>
  new SubscriberController(req, res).unsubscribe()
);
// Endpoint to send marketing emails to all subscribers
router.post(
  "/sendMarketingEmail",
  languageMiddleware,
  auth.isAuthenticated,
  (req, res) => new SubscriberController(req, res).sendMarketingEmail()
);
module.exports = router;
