// routes/admin.js
import { Router } from "express";
import { isAuthenticated } from "../../middleware/auth.js";
const router = Router();

router.put(
  "/cors-whitelist",
  // isAuthenticated,
  async (req, res, next) => {
    try {
      const controller = req.scope.resolve("adminController");
      await controller.updateCorsWhitelist();
    } catch (error) {
      next(error);
    }
  }
);
export default router;
