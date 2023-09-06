const express = require('express');
const router = express.Router();
const { AddStock, getAllStock, viewOne, BuyStock, GetStock, GetSingleBuyStock, SellStock, GetSellStock, totalUnit, totalInvest, totalSold, currentAmount, OverAllprofit } = require("../controllers/StockController"); //controller for adding stock
const { stockvalidator } = require("../middleware/StockValidator");//middleware for stock validator 
const { verifyUser } = require("../middleware/auth"); //middleware for varifying user
//add stock route
router.post("/addStock", stockvalidator, AddStock)
router.get("/AllStock", verifyUser, getAllStock)
router.get("/Stock/:id", verifyUser, viewOne)
router.post("/BuyStock", verifyUser, BuyStock)
router.get("/GetStock", verifyUser, GetStock)
router.get("/GetSingleBuyStock/:id", verifyUser, GetSingleBuyStock)
router.post("/SellStock", verifyUser, SellStock)
router.get("/GetSellStock", verifyUser, GetSellStock)
router.get("/totalUnit", verifyUser, totalUnit)
router.get("/totalInvest", verifyUser, totalInvest)
router.get("/totalSold", verifyUser, totalSold)
router.get("/currentAmount", verifyUser, currentAmount)
router.get("/OverAllprofit", verifyUser, OverAllprofit)

module.exports = router;