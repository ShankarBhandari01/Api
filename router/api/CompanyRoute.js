import { Router } from "express";
import { isAuthenticated } from "../../middleware/auth.js";
import { languageMiddleware } from "../../middleware/languageMiddleware.js";
import checkAccess from "../../middleware/CheckAccess.js";
import fileupload from "../../middleware/fileUploadMiddleware.js";
import CompanyController from "../../controllers/CompanyController.js";

const router = Router();
// GET company info
router.get("/getCompanyInfo", languageMiddleware, (req, res) => {
  new CompanyController(req, res).getCompanyInfo();
});
// POST company info
router.post(
  "/addCompanyInfo",
  languageMiddleware,
  fileupload.uploadImage,
 // auth.isAuthenticated,
  //checkAccess("/addCompanyInfo", "write"),
  (req, res) => new CompanyController(req, res).addCompanyInfo()
);
// POST add table
router.post(
  "/addTable",
  languageMiddleware,
  isAuthenticated,
  checkAccess("/addTable", "write"),
  (req, res) => new CompanyController(req, res).addTable()
);
// POST Menu
router.post(
  "/routeMenu",
  languageMiddleware,
  isAuthenticated,
  checkAccess("/addMenu", "write"),
  (req, res) => new CompanyController(req, res).addMenu()
);
// GET Menu
router.get(
  "/routeMenu",
  languageMiddleware,
  isAuthenticated,
  checkAccess("/menus", "read"),
  (req, res) => new CompanyController(req, res).getMenus()
);
router.put(
  "/routeMenu/:id",
  languageMiddleware,
  isAuthenticated,
  checkAccess("/menus", "update"),
  (req, res) => new CompanyController(req, res).updateMenu()
);
// DELETE Menu
router.delete(
  "/routeMenu/:id",
  languageMiddleware,
  isAuthenticated,
  checkAccess("/menus", "delete"),
  (req, res) => new CompanyController(req, res).deleteMenu()
);
// POST Role
router.post(
  "/addRole",
  languageMiddleware,
  isAuthenticated,
  checkAccess("/addRole", "write"),
  (req, res) => new CompanyController(req, res).addRole()
);
// GET Roles
router.get(
  "/roles",
  languageMiddleware,
  isAuthenticated,
  checkAccess("/roles", "read"),
  (req, res) => new CompanyController(req, res).getRoles()
);
// PUT Role
router.put(
  "/roles/:id",
  languageMiddleware,
  isAuthenticated,
  checkAccess("/roles", "update"),
  (req, res) => new CompanyController(req, res).updateRole()
);
// DELETE Role
router.delete(
  "/roles/:id",
  languageMiddleware,
  isAuthenticated,
  checkAccess("/roles", "detele"),
  (req, res) => new CompanyController(req, res).deleteRole()
);

// notification apis
// GET notification
router.get(
  "/notification",
  languageMiddleware,
  isAuthenticated,
  (req, res) => new CompanyController(req, res).getNotifications()
);
// PUT notification
router.put(
  "/notification/:id",
  languageMiddleware,
  isAuthenticated,
  (req, res) => new CompanyController(req, res).updateNotification()
);
// DELETE notification
router.delete(
  "/notification/:id",
  languageMiddleware,
  isAuthenticated,
  (req, res) => new CompanyController(req, res).deleteNotification()
);

export default router;
