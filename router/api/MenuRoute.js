import { Router } from "express";
import { isAuthenticated } from "../../middleware/auth.js";
import checkAccess from "../../middleware/CheckAccess.js";
import MenuController from "../../controllers/MenuController.js";

const router = Router();

// POST menu Types
router.post("/menuType", isAuthenticated, (req, res) =>
  new MenuController(req, res).addMenuTypes()
);
// POST add menu
router.post("/addMenu", isAuthenticated, (req, res) =>
  new MenuController(req, res).addMenu()
);
router.get("/menuType", (req, res) =>
  new MenuController(req, res).getMenuTypes()
);

// GET menu
router.get("/allMenus", (req, res) =>
  new MenuController(req, res).getAllMenus()
);
// GET menu by ID
router.get("/menus/:id", (req, res) => new MenuController(req, res).getMenu());
// PUT update menu
router.put("/menus/:id", isAuthenticated, (req, res) =>
  new MenuController(req, res).updateMenu()
);
// DELETE menu
router.delete("/menus/:id", isAuthenticated, (req, res) =>
  new MenuController(req, res).deleteMenu()
);
// DELETE menu type
router.delete("/menuType/:id", isAuthenticated, (req, res) =>
  new MenuController(req, res).deleteMenuType()
);

export default router;
