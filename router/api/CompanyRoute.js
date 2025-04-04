const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const {languageMiddleware} = require("../../middleware/languageMiddleware");
const fileupload = require("../../middleware/fileUploadMiddleware");

const {
  getCompanyInfo,
  addCompanyInfo,
} = require("../../controllers/CompanyController");

router.get("/getCompanyInfo", languageMiddleware, getCompanyInfo);
router.post(
  "/addCompanyInfo",
  languageMiddleware,
  fileupload.uploadImage,
  auth.isAuthunticated,
  addCompanyInfo
);

module.exports = router;
