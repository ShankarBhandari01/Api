// routes/admin.js
import { Router } from "express";
import { isAuthenticated } from "../../middleware/auth.js";
const router = Router();

router.put("/cors-whitelist", isAuthenticated, async (req, res, next) => {
  try {
    const controller = req.scope.resolve("adminController");
    await controller.updateCorsWhitelist();
  } catch (error) {
    next(error);
  }
});
router.post("/uploadLinks", isAuthenticated, async (req, res, next) => {
  try {
    const controller = req.scope.resolve("adminController");
    await controller.uploadVideoLinks();
  } catch (error) {
    next(error);
  }
});

router.put("/updateLinks/:id", isAuthenticated, async (req, res, next) => {
  try {
    const controller = req.scope.resolve("adminController");
    await controller.updateVideoLink();
  } catch (error) {
    next(error);
  }
});

router.get("/getVideoLinks", async (req, res, next) => {
  try {
    const controller = req.scope.resolve("adminController");
    await controller.getVideoLinks();
  } catch (error) {
    next(error);
  }
});

router.delete("/deleteLinks/:id", isAuthenticated, async (req, res, next) => {
  try {
    const controller = req.scope.resolve("adminController");
    await controller.deleteVideoLinks();
  } catch (error) {
    next(error);
  }
});

export default router;
