import { Router } from "express";
const router = Router();
import { languageMiddleware } from "../../middleware/languageMiddleware.js";
import OrderController from "../../controllers/OrderController.js";
import { isAuthenticated } from "../../middleware/auth.js"; //middleware for varifying user

router.post("/saveOrder", languageMiddleware, (req, res) =>
  new OrderController(req, res).saveOrder()
);

router.get("/status/:orderId", languageMiddleware, (req, res) =>
  new OrderController(req, res).getOrderStatus()
);

router.put(
  "/orders/:orderId/:status",
  languageMiddleware,
  isAuthenticated,
  (req, res) => new OrderController(req, res).updateStatus()
);
router.get("/AllOrders", languageMiddleware, isAuthenticated, (req, res) =>
  new OrderController(req, res).getOrderByStatusOrAll()
);

export default router;
