const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const {languageMiddleware} = require("../../middleware/languageMiddleware");
const fileupload = require("../../middleware/fileUploadMiddleware");

const {
  getCompanyInfo,
  addCompanyInfo,
    addTable,
} = require("../../controllers/CompanyController");

router.get("/getCompanyInfo", languageMiddleware, getCompanyInfo);
router.post(
  "/addCompanyInfo",
  languageMiddleware,
  fileupload.uploadImage,
  auth.isAuthunticated,
  addCompanyInfo
);

// add tables 
router.post("/addTable",languageMiddleware, auth.isAuthunticated, addTable)
module.exports = router;
