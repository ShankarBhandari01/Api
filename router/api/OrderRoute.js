import { Router } from "express";
import { isAuthenticated } from "../../middleware/auth.js";

const router = Router();

router.post("/saveOrder", async (req, res, next) => {
  try {
    const controller = req.scope.resolve("orderController");
    await controller.saveOrder();
  } catch (error) {
    next(error);
  }
});

router.get("/status/:orderId", async (req, res, next) => {
  try {
    const controller = req.scope.resolve("orderController");
    await controller.getOrderStatus();
  } catch (error) {
    next(error);
  }
});

router.put(
  "/orders/:orderId/:status",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const controller = req.scope.resolve("orderController");
      await controller.updateStatus();
    } catch (error) {
      next(error);
    }
  }
);
router.get("/AllOrders", isAuthenticated, async (req, res, next) => {
  try {
    const controller = req.scope.resolve("orderController");
    await controller.getOrderByStatusOrAll();
  } catch (error) {
    next(error);
  }
});

export default router;
