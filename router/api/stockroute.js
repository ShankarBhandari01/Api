const express = require("express");
const router = express.Router();
const {
  saveStock,
  addCategory,
  getAllStock,
  getAllCategory,
  viewOne,
} = require("../../controllers/StockController"); //controller for adding stock
const { stockvalidator } = require("../../middleware/StockValidator"); //middleware for stock validator
const auth = require("../../middleware/auth"); //middleware for varifying user
// middleware for image upload
const fileupload = require("../../middleware/fileUploadMiddleware");
const {languageMiddleware} = require("../../middleware/languageMiddleware");

//add stock route
router.post(
  "/addStock",
  languageMiddleware,
  fileupload.uploadStock,
  stockvalidator,
  saveStock
);
router.get("/getallstock", languageMiddleware, getAllStock);
router.post(
  "/addCategory",
  languageMiddleware,
  auth.isAuthenticated,
  addCategory
);
router.get("/getAllCategory", languageMiddleware, getAllCategory);

module.exports = router;
