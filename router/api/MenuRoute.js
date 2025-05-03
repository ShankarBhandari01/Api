import { Router } from "express";

import { isAuthenticated } from "../../middleware/auth.js";
import { languageMiddleware } from "../../middleware/languageMiddleware.js";
import checkAccess from "../../middleware/CheckAccess.js";
import MenuController from "../../controllers/MenuController.js";

const router = Router();

// POST menu Types
router.post("/menuType", languageMiddleware, isAuthenticated, (req, res) =>
  new MenuController(req, res).addMenuTypes()
);
// POST add menu
router.post("/addMenu", languageMiddleware, isAuthenticated, (req, res) =>
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
router.put("/menus/:id", languageMiddleware, isAuthenticated, (req, res) =>
  new MenuController(req, res).updateMenu()
);
// DELETE menu
router.delete(
  "/menus/:id",
  languageMiddleware,
  isAuthenticated,
  (req, res) => new MenuController(req, res).deleteMenu()
);
// DELETE menu type
router.delete(
  "/menuType/:id",
  languageMiddleware,
  isAuthenticated,
  (req, res) => new MenuController(req, res).deleteMenuType()
);

export default router;
