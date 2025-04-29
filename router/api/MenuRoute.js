const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { languageMiddleware } = require("../../middleware/languageMiddleware");
const checkAccess = require("../../middleware/CheckAccess");
const MenuController = require("../../controllers/MenuController");

// POST menu Types
router.post("/menuType", languageMiddleware, auth.isAuthenticated, (req, res) =>
  new MenuController(req, res).addMenuTypes()
);
// POST add menu
router.post("/addMenu", languageMiddleware, auth.isAuthenticated, (req, res) =>
  new MenuController(req, res).addMenu()
);
router.get("/menuType", languageMiddleware, (req, res) =>
  new MenuController(req, res).getMenuTypes()
);

// GET menu
router.get("/allMenus", languageMiddleware, (req, res) =>
  new MenuController(req, res).getAllMenus()
);
// GET menu by ID
router.get("/menus/:id", languageMiddleware, (req, res) =>
  new MenuController(req, res).getMenu()
);
// PUT update menu
router.put("/menus/:id", languageMiddleware, auth.isAuthenticated, (req, res) =>
  new MenuController(req, res).updateMenu()
);
// DELETE menu
router.delete(
  "/menus/:id",
  languageMiddleware,
  auth.isAuthenticated,
  (req, res) => new MenuController(req, res).deleteMenu()
);
// DELETE menu type
router.delete(
  "/menuType/:id",
  languageMiddleware,
  auth.isAuthenticated,
  (req, res) => new MenuController(req, res).deleteMenuType()
);

module.exports = router;
