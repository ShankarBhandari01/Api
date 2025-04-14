const express = require("express");
const router = express.Router();
const { languageMiddleware } = require("../../middleware/languageMiddleware");
const { campaignSchemaValidation } = require("../../middleware/DataValidator");
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
// Endpoint to add Campaingn to all subscribers
router.post(
  "/addCampaingn",
  languageMiddleware,
  auth.isAuthenticated,
  campaignSchemaValidation,
  (req, res) => new SubscriberController(req, res).addCampaingn()
);
module.exports = router;
