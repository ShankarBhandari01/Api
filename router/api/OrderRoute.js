const express = require("express");
const router = express.Router();
const { languageMiddleware } = require("../../middleware/languageMiddleware");
const OrderController = require("../../controllers/OrderController");
const auth = require("../../middleware/auth"); //middleware for varifying user

router.post("/saveOrder", languageMiddleware, (req, res) =>
  new OrderController(req, res).saveOrder()
);

router.get("/status/:orderId", languageMiddleware, (req, res) =>
  new OrderController(req, res).getOrderStatus()
);

router.put(
  "/orders/:orderId/:status",
  languageMiddleware,
  auth.isAuthenticated,
  (req, res) => new OrderController(req, res).updateStatus()
);
router.get("/AllOrders", languageMiddleware, auth.isAuthenticated, (req, res) =>
  new OrderController(req, res).getOrderByStatusOrAll()
);

module.exports = router;
