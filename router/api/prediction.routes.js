import { Router } from "express";

const router = Router();

// Define routes
router.get("/predict", async (req, res, next) => {
  try {
    const controller = req.scope.resolve("predictionController");
    await controller.predict();
  } catch (error) {
    next(error);
  }
});

export default router;
