import { Router } from "express";
import { isAuthenticated } from "../../middleware/auth.js";
import checkAccess from "../../middleware/CheckAccess.js";
import fileupload from "../../middleware/fileUploadMiddleware.js";

const router = Router();

// GET company info
router.get("/getCompanyInfo", async (req, res, next) => {
  try {
    const controller = req.scope.resolve("companyController");
    await controller.getCompanyInfo();
  } catch (e) {
    next(e);
  }
});
// PUT company info
router.put("/updateClosedDates", async (req, res, next) => {
  try {
    const controller = req.scope.resolve("companyController");
    await controller.updateClosedDates();
  } catch (e) {
    next(e);
  }
});

// POST company info
router.post(
  "/addCompanyInfo",
  isAuthenticated,
  fileupload.uploadImage,
  async (req, res, next) => {
    try {
      const controller = req.scope.resolve("companyController");
      await controller.addCompanyInfo();
    } catch (e) {
      next(e);
    }
  }
);

// POST add table
router.post(
  "/addTable",
  isAuthenticated,
  checkAccess("/addTable", "write"),
  async (req, res, next) => {
    try {
      const controller = req.scope.resolve("companyController");
      await controller.addTable();
    } catch (e) {
      next(e);
    }
  }
);

// POST Menu
router.post(
  "/routeMenu",
  isAuthenticated,
  checkAccess("/addMenu", "write"),
  async (req, res, next) => {
    try {
      const controller = req.scope.resolve("companyController");
      await controller.addMenu();
    } catch (e) {
      next(e);
    }
  }
);

// GET Menu
router.get(
  "/routeMenu",
  isAuthenticated,
  checkAccess("/menus", "read"),
  async (req, res, next) => {
    try {
      const controller = req.scope.resolve("companyController");
      await controller.getMenus();
    } catch (e) {
      next(e);
    }
  }
);

// PUT Menu
router.put(
  "/routeMenu/:id",
  isAuthenticated,
  checkAccess("/menus", "update"),
  async (req, res, next) => {
    try {
      const controller = req.scope.resolve("companyController");
      await controller.updateMenu();
    } catch (e) {
      next(e);
    }
  }
);

// DELETE Menu
router.delete(
  "/routeMenu/:id",
  isAuthenticated,
  checkAccess("/menus", "delete"),
  async (req, res, next) => {
    try {
      const controller = req.scope.resolve("companyController");
      await controller.deleteMenu();
    } catch (e) {
      next(e);
    }
  }
);

// POST Role
router.post(
  "/addRole",
  isAuthenticated,
  checkAccess("/addRole", "write"),
  async (req, res, next) => {
    try {
      const controller = req.scope.resolve("companyController");
      await controller.addRole();
    } catch (e) {
      next(e);
    }
  }
);

// GET Roles
router.get(
  "/roles",
  isAuthenticated,
  checkAccess("/roles", "read"),
  async (req, res, next) => {
    try {
      const controller = req.scope.resolve("companyController");
      await controller.getRoles();
    } catch (e) {
      next(e);
    }
  }
);

// PUT Role
router.put(
  "/roles/:id",
  isAuthenticated,
  checkAccess("/roles", "update"),
  async (req, res, next) => {
    try {
      const controller = req.scope.resolve("companyController");
      await controller.updateRole();
    } catch (e) {
      next(e);
    }
  }
);

// DELETE Role
router.delete(
  "/roles/:id",
  isAuthenticated,
  checkAccess("/roles", "delete"),
  async (req, res, next) => {
    try {
      const controller = req.scope.resolve("companyController");
      await controller.deleteRole();
    } catch (e) {
      next(e);
    }
  }
);

// GET notification
router.get("/notification", isAuthenticated, async (req, res, next) => {
  try {
    const controller = req.scope.resolve("companyController");
    await controller.getNotifications();
  } catch (e) {
    next(e);
  }
});

// PUT notification
router.put(
  "/notification/markAllAsRead",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const controller = req.scope.resolve("companyController");
      await controller.updateAllSeenStatus();
    } catch (e) {
      next(e);
    }
  }
);
// PUT notification
router.put("/notification/:id", isAuthenticated, async (req, res, next) => {
  try {
    const controller = req.scope.resolve("companyController");
    await controller.updateNotification();
  } catch (e) {
    next(e);
  }
});

// DELETE notification
router.delete("/notification/:id", isAuthenticated, async (req, res, next) => {
  try {
    const controller = req.scope.resolve("companyController");
    await controller.deleteNotification();
  } catch (e) {
    next(e);
  }
});

export default router;
