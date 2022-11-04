const express = require('express');
const router = express.Router();
const controller = require("../controllers/StockController"); //controller for adding stock
const { stockvalidator } = require("../middleware/StockValidator");//middleware for stock validator 
const { verifyUser } = require("../middleware/auth"); //middleware for varifying user
//add stock route
router.post("/addStock", stockvalidator, controller.AddStock)
router.get("/AllStock", verifyUser, controller.getAllStock)
router.get("/Stock/:id", verifyUser,controller.viewOne)
router.post("/BuyStock",verifyUser,controller.BuyStock)
router.get("/GetStock",verifyUser, controller.GetStock)
router.get("/GetSingleBuyStock/:id",verifyUser, controller.GetSingleBuyStock)
router.post("/SellStock",verifyUser,controller.SellStock)
router.get("/GetSellStock",verifyUser,controller.GetSellStock)

router.get("/totalUnit",verifyUser,controller.totalUnit)
router.get("/totalInvest",verifyUser,controller.totalInvest)
router.get("/totalSold",verifyUser,controller.totalSold)
router.get("/currentAmount",verifyUser,controller.currentAmount)
router.get("/OverAllprofit",verifyUser,controller.OverAllprofit)

module.exports = router;