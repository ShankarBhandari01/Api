import { Router } from "express";
import OrderController from "../../controllers/OrderController.js";
import { isAuthenticated } from "../../middleware/auth.js"; //middleware for varifying user

const router = Router();

router.post("/saveOrder", (req, res) =>
  new OrderController(req, res).saveOrder()
);

router.get("/status/:orderId", (req, res) =>
  new OrderController(req, res).getOrderStatus()
);

router.put("/orders/:orderId/:status", isAuthenticated, (req, res) =>
  new OrderController(req, res).updateStatus()
);
router.get("/AllOrders", isAuthenticated, (req, res) =>
  new OrderController(req, res).getOrderByStatusOrAll()
);

export default router;
