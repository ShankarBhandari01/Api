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
// PUT // api/reservation update
router.put(
  "/updateReservationStatus/:reservationId",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const controller = req.scope.resolve("reservationController");
      await controller.updateReservationStatus();
    } catch (error) {
      next(error);
    }
  }
);
// GET // api/reservations
router.get("/getAllReservations", 
// isAuthenticated,
   async (req, res, next) => {
  try {
    const controller = req.scope.resolve("reservationController");
    await controller.getReservations();
  } catch (err) {
    next(err);
  }
});

router.post("/test/notify", async (req, res) => {
  const controller = req.scope.resolve("reservationController");
  await controller.sendNotification();
  res.json({ status: "Notification sent" });
});

export default router;
