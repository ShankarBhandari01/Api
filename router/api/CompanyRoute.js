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
// POST Menu
router.post("/addMenu", languageMiddleware, auth.isAuthenticated, (req, res) =>
  new CompanyController(req, res).addMenu()
);
// POST Menu
router.post("/addRole", languageMiddleware, auth.isAuthenticated, (req, res) =>
  new CompanyController(req, res).addRole()
);
// GET Menu
router.get("/menus", languageMiddleware, auth.isAuthenticated, (req, res) =>
  new CompanyController(req, res).getMenus()
);
// GET Menu
router.get("/roles", languageMiddleware, auth.isAuthenticated, (req, res) =>
  new CompanyController(req, res).getRoles()
);

router.put("/roles/:id", languageMiddleware, auth.isAuthenticated, (req, res) =>
  new CompanyController(req, res).updateRole()
);
module.exports = router;
