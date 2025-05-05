import { Router } from "express";
import { campaignSchemaValidation } from "../../middleware/DataValidator.js";
import SubscriberController from "../../controllers/SubscriberController.js";
import { isAuthenticated } from "../../middleware/auth.js";

const router = Router();

// Endpoint to subscribe user
router.post("/subscribe", (req, res) =>
  new SubscriberController(req, res).subscribe()
);

// Endpoint to unsubscribe user
router.post("/unsubscribe", (req, res) =>
  new SubscriberController(req, res).unsubscribe()
);
// Endpoint to add Campaingn to all subscribers
router.post(
  "/addCampaingn",
  isAuthenticated,
  campaignSchemaValidation,
  (req, res) => new SubscriberController(req, res).addCampaingn()
);
export default router;
