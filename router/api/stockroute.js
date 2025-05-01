import { Router } from "express";
const router = Router();
import { saveStock, addCategory, getAllStock, getAllCategory } from "../../controllers/StockController.js"; //controller for adding stock
import { stockvalidator } from "../../middleware/StockValidator.js"; //middleware for stock validator
import { isAuthenticated } from "../../middleware/auth.js"; //middleware for varifying user
// middleware for image upload
import fileupload from "../../middleware/fileUploadMiddleware.js";
import { languageMiddleware } from "../../middleware/languageMiddleware.js";


//add stock route
router.post(
  "/addStock",
  languageMiddleware,
  fileupload.uploadStock,
  stockvalidator,
  isAuthenticated,
  saveStock
);
router.get("/getallstock", languageMiddleware, getAllStock);
router.post(
  "/addCategory",
  languageMiddleware,
  isAuthenticated,
  addCategory
);
router.get("/getAllCategory", languageMiddleware, getAllCategory);

export default router;
