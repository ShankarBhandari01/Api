import { Router } from "express";
import { isAuthenticated } from "../../middleware/auth.js";
const router = Router();

// GET Company Profromance reports
router.get("/analyse_reports",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const controller = req.scope.resolve("reportingController");
      await controller.getCompanyReport()
    } catch (e) {
      next(e)
    }
  })


export default router;