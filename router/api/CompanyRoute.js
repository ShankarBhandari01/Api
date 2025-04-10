const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { languageMiddleware } = require("../../middleware/languageMiddleware");
const fileupload = require("../../middleware/fileUploadMiddleware");

const CompanyController = require("../../controllers/CompanyController");

// GET company info
router.get("/getCompanyInfo", languageMiddleware, (req, res) => {
  new CompanyController(req, res).getCompanyInfo();
});

// POST company info
router.post(
  "/addCompanyInfo",
  languageMiddleware,
  fileupload.uploadImage,
  auth.isAuthenticated,
  (req, res) => new CompanyController(req, res).addCompanyInfo()
);

// POST add table
router.post("/addTable", languageMiddleware, auth.isAuthenticated, (req, res) =>
  new CompanyController(req, res).addTable()
);

module.exports = router;
