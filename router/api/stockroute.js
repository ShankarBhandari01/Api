import { Router } from "express";
import fileupload from "../../middleware/fileUploadMiddleware.js";
import { stockvalidator } from "../../middleware/StockValidator.js";
import { isAuthenticated } from "../../middleware/auth.js";
import StockController from "../../controllers/StockController.js";

const router = Router();
// Add stock route
router.post(
  "/addStock",
  fileupload.uploadStock,
  stockvalidator,
  isAuthenticated,
  (req, res) => new StockController(req, res).saveStock()
);

// Get all stock
router.get("/getallstock", (req, res) =>
  new StockController(req, res).getAllStock()
);

// Add category
router.post("/addCategory", isAuthenticated, (req, res) =>
  new StockController(req, res).addCategory()
);

// Get all categories
router.get("/getAllCategory", (req, res) =>
  new StockController(req, res).getAllCategory()
);

// Search category
router.get("/searchCategory", (req, res) =>
  new StockController(req, res).searchCategory()
);

export default router;
