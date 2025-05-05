import { Router } from "express";
import ReservationController from "../../controllers/ReservationController.js";
import { isAuthenticated } from "../../middleware/auth.js"; //middleware for varifying user
import { reservationValidationSchema } from "../../middleware/DataValidator.js";
const router = Router();

// POST // api/reservations
router.post("/reservations", reservationValidationSchema, (req, res) =>
  new ReservationController(req, res).addReservation()
);

// GET // api/reservations
router.get("/getAllReservations", isAuthenticated, (req, res) =>
  new ReservationController(req, res).getReservations()
);

export default router;
