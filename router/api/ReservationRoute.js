import { Router } from "express";
import { isAuthenticated } from "../../middleware/auth.js"; //middleware for varifying user
import { reservationValidationSchema } from "../../middleware/DataValidator.js";
const router = Router();

// POST // api/reservations
router.post(
  "/reservations",
  reservationValidationSchema,
  async (req, res, next) => {
    try {
      const controller = req.scope.resolve("reservationController");
      await controller.addReservation();
    } catch (err) {
      next(err);
    }
  }
);

// GET // api/reservations
router.get("/getAllReservations", async (req, res, next) => {
  try {
    const controller = req.scope.resolve("reservationController");
    await controller.getReservations();
  } catch (err) {
    next(err);
  }
});

export default router;
