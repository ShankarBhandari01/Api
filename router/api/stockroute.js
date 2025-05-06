import { Router } from "express";
import fileupload from "../../middleware/fileUploadMiddleware.js";
import { stockvalidator } from "../../middleware/StockValidator.js";
import { isAuthenticated } from "../../middleware/auth.js";

const router = Router();
// Add stock route
router.post(
  "/addStock",
  fileupload.uploadStock,
  stockvalidator,
  isAuthenticated,
  async (req, res, next) => {
    try {
      const controller = req.scope.resolve("stockController");
      await controller.saveStock();
    } catch (err) {
      next(err);
    }
  }
);

// Get all stock
router.get("/getallstock", async (req, res, next) => {
  try {
    const controller = req.scope.resolve("stockController");
    await controller.getAllStock();
  } catch (err) {
    next(err);
  }
});

// Add category
router.post("/addCategory", isAuthenticated, async (req, res) => {
  try {
    const controller = req.scope.resolve("stockController");
    await controller.addCategory();
  } catch (err) {
    next(err);
  }
});

// Get all categories
router.get("/getAllCategory", async (req, res, next) => {
  try {
    const controller = req.scope.resolve("stockController");
    await controller.getAllCategory();
  } catch (err) {
    next(err);
  }
});

// Search category
router.get("/searchCategory", async (req, res, next) => {
  try {
    const controller = req.scope.resolve("stockController");
    await controller.searchCategory();
  } catch (err) {
    next(err);
  }
});

export default router;
