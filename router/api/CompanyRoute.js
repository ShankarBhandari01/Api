const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const {languageMiddleware} = require("../../middleware/languageMiddleware");

const {
  getCompanyInfo,
  addCompanyInfo,
} = require("../../controllers/CompanyController");

router.get("/getCompanyInfo", languageMiddleware, getCompanyInfo);
router.post(
  "/addCompanyInfo",
  languageMiddleware,
  auth.isAuthunticated,
  addCompanyInfo
);

module.exports = router;
