const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { languageMiddleware } = require("../../middleware/languageMiddleware");
const checkAccess = require("../../middleware/CheckAccess");
const { addMenuTypes } = require("../../controllers/StockController");
const MenuController = require("../../controllers/MenuController");

// POST menu Types
router.post(
  "/menuType",
  languageMiddleware,
  auth.isAuthenticated,
  addMenuTypes
);
// POST add menu
router.post(
  "/addMenu",
  languageMiddleware,
  auth.isAuthenticated,
  (req, res) => new MenuController(req, res).addMenu()
);
// GET menu
router.get("/menus", languageMiddleware, (req, res) =>
  new MenuController(req, res).getAllMenus()
);
// GET menu by ID
router.get("/menus/:id", languageMiddleware, (req, res) =>
  new MenuController(req, res).getMenu()
);
// PUT update menu
router.put(
  "/menus/:id",
  languageMiddleware,
  auth.isAuthenticated,
  (req, res) => new MenuController(req, res).updateMenu()
);
// DELETE menu
router.delete(
  "/menus/:id",
  languageMiddleware,
  auth.isAuthenticated,
  (req, res) => new MenuController(req, res).deleteMenu()
);

module.exports = router;
