import { Router } from "express";
import { campaignSchemaValidation } from "../../middleware/DataValidator.js";
import { isAuthenticated } from "../../middleware/auth.js";

const router = Router();

// Endpoint to subscribe user
router.post("/subscribe", async (req, res, next) => {
  try {
    const controller = req.scope.resolve("subscriberController");
    await controller.subscribe();
  } catch (err) {
    next(err);
  }
});

router.get("/getAllSubscribers", isAuthenticated, async (req, res, next) => {
  try {
    const controller = req.scope.resolve("subscriberController");
    await controller.getAllSubscribe();
  } catch (err) {
    next(err);
  }
});

// Endpoint to unsubscribe user
router.post("/unsubscribe", async (req, res, next) => {
  try {
    const controller = req.scope.resolve("subscriberController");
    await controller.unsubscribe()();
  } catch (err) {
    next(err);
  }
});
// Endpoint to add Campaingn to all subscribers
router.post(
  "/addCampaingn",
  isAuthenticated,
  campaignSchemaValidation,
  async (req, res, next) => {
    try {
      const controller = req.scope.resolve("subscriberController");
      await controller.addCampaingn()();
    } catch (err) {
      next(err);
    }
  }
);
export default router;
