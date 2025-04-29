const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { languageMiddleware } = require("../../middleware/languageMiddleware");
const checkAccess = require("../../middleware/CheckAccess");
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
  checkAccess("/addCompanyInfo", "write"),
  (req, res) => new CompanyController(req, res).addCompanyInfo()
);
// POST add table
router.post(
  "/addTable",
  languageMiddleware,
  auth.isAuthenticated,
  checkAccess("/addTable", "write"),
  (req, res) => new CompanyController(req, res).addTable()
);
// POST Menu
router.post(
  "/routeMenu",
  languageMiddleware,
  auth.isAuthenticated,
  checkAccess("/addMenu", "write"),
  (req, res) => new CompanyController(req, res).addMenu()
);
// GET Menu
router.get(
  "/routeMenu",
  languageMiddleware,
  auth.isAuthenticated,
  checkAccess("/menus", "read"),
  (req, res) => new CompanyController(req, res).getMenus()
);
router.put(
  "/routeMenu/:id",
  languageMiddleware,
  auth.isAuthenticated,
  checkAccess("/menus", "update"),
  (req, res) => new CompanyController(req, res).updateMenu()
);
// DELETE Menu
router.delete(
  "/routeMenu/:id",
  languageMiddleware,
  auth.isAuthenticated,
  checkAccess("/menus", "delete"),
  (req, res) => new CompanyController(req, res).deleteMenu()
);
// POST Role
router.post(
  "/addRole",
  languageMiddleware,
  auth.isAuthenticated,
  checkAccess("/addRole", "write"),
  (req, res) => new CompanyController(req, res).addRole()
);
// GET Roles
router.get(
  "/roles",
  languageMiddleware,
  auth.isAuthenticated,
  checkAccess("/roles", "read"),
  (req, res) => new CompanyController(req, res).getRoles()
);
// PUT Role
router.put(
  "/roles/:id",
  languageMiddleware,
  auth.isAuthenticated,
  checkAccess("/roles", "update"),
  (req, res) => new CompanyController(req, res).updateRole()
);
// DELETE Role
router.delete(
  "/roles/:id",
  languageMiddleware,
  auth.isAuthenticated,
  checkAccess("/roles", "detele"),
  (req, res) => new CompanyController(req, res).deleteRole()
);

// notification apis
// GET notification
router.get(
  "/notification",
  languageMiddleware,
  auth.isAuthenticated,
  (req, res) => new CompanyController(req, res).getNotifications()
);
// PUT notification
router.put(
  "/notification/:id",
  languageMiddleware,
  auth.isAuthenticated,
  (req, res) => new CompanyController(req, res).updateNotification()
);
// DELETE notification
router.delete(
  "/notification/:id",
  languageMiddleware,
  auth.isAuthenticated,
  (req, res) => new CompanyController(req, res).deleteNotification()
);

module.exports = router;
