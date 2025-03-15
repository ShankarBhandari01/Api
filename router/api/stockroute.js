const express = require("express");
const router = express.Router();
const {
  saveStock,
  getAllStock,
  viewOne,
  BuyStock,
  GetStock,
  GetSingleBuyStock,
  SellStock,
  GetSellStock,
  totalUnit,
  totalInvest,
  totalSold,
  currentAmount,
  OverAllprofit,
} = require("../../controllers/StockController"); //controller for adding stock
const { stockvalidator } = require("../../middleware/StockValidator"); //middleware for stock validator
const auth = require("../../middleware/auth"); //middleware for varifying user
// middleware for image upload
const fileupload =  require('../../middleware/fileUploadMiddleware');;

//add stock route
router.post("/addStock",fileupload.uploadStock ,stockvalidator, saveStock);
router.get("/getallstock", getAllStock);
router.get("/Stock/:id", auth.isAuthunticated, viewOne);
router.post("/BuyStock", auth.isAuthunticated, BuyStock);
router.get("/GetStock", auth.isAuthunticated, GetStock);
router.get("/GetSingleBuyStock/:id", auth.isAuthunticated, GetSingleBuyStock);
router.post("/SellStock", auth.isAuthunticated, SellStock);
router.get("/GetSellStock", auth.isAuthunticated, GetSellStock);
router.get("/totalUnit", auth.isAuthunticated, totalUnit);
router.get("/totalInvest", auth.isAuthunticated, totalInvest);
router.get("/totalSold", auth.isAuthunticated, totalSold);
router.get("/currentAmount", auth.isAuthunticated, currentAmount);
router.get("/OverAllprofit", auth.isAuthunticated, OverAllprofit);

module.exports = router;
