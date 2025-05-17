import { Router } from "express";
import { isAuthenticated } from "../../middleware/auth.js";

const router = Router();

// POST menu Types
router.post("/menuType", isAuthenticated, async (req, res, next) => {
  try {
    const controller = req.scope.resolve("menuController");
    await controller.addMenuTypes();
  } catch (error) {
    next(error);
  }
});
// POST add menu
router.post("/addMenu", async (req, res, next) => {
  try {
    const controller = req.scope.resolve("menuController");
    await controller.addMenu();
  } catch (error) {
    next(error);
  }
});
router.get("/menuType", async (req, res, next) => {
  try {
    const controller = req.scope.resolve("menuController");
    await controller.getMenuTypes();
  } catch (error) {
    next(error);
  }
});

/// GET all menus
router.get("/allMenus", async (req, res, next) => {
  try {
    const controller = req.scope.resolve("menuController");
    await controller.getAllMenus();
  } catch (error) {
    next(error);
  }
});

// GET menu by ID
router.get("/menus/:id", async (req, res, next) => {
  try {
    const controller = req.scope.resolve("menuController");
    await controller.getMenu();
  } catch (error) {
    next(error);
  }
});

// PUT update menu
router.put("/menus/:id", isAuthenticated, async (req, res, next) => {
  try {
    const controller = req.scope.resolve("menuController");
    await controller.updateMenu();
  } catch (error) {
    next(error);
  }
});

// DELETE menu
router.delete("/menus/:id", isAuthenticated, async (req, res, next) => {
  try {
    const controller = req.scope.resolve("menuController");
    await controller.deleteMenu();
  } catch (error) {
    next(error);
  }
});

// DELETE menu type
router.delete("/menuType/:id", isAuthenticated, async (req, res, next) => {
  try {
    const controller = req.scope.resolve("menuController");
    await controller.deleteMenuType();
  } catch (error) {
    next(error);
  }
});

export default router;
