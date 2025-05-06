import { Router } from "express";
import { campaignSchemaValidation } from "../../middleware/DataValidator.js";
//import SubscriberController from "../../controllers/SubscriberController.js";
import { isAuthenticated } from "../../middleware/auth.js";
import container from "../../containers/Containers.js";

const router = Router();
// Resolve the controller using the container
const subscriberController = container.resolve("subscriberController");
// Endpoint to subscribe user
router.post("/subscribe", (req, res) =>
  subscriberController.subscribe(req, res)
);

// Endpoint to unsubscribe user
router.post("/unsubscribe", (req, res) =>
  subscriberController.unsubscribe(req, res)
);
// Endpoint to add Campaingn to all subscribers
router.post(
  "/addCampaingn",
  isAuthenticated,
  campaignSchemaValidation,
  (req, res) => subscriberController.addCampaingn(req, res)
);
export default router;
