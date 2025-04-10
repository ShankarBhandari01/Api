const express = require("express");
const router = express.Router();
const { languageMiddleware } = require("../../middleware/languageMiddleware");
const ReservationController = require("../../controllers/ReservationController");
const auth = require("../../middleware/auth"); //middleware for varifying user
const {
  reservationValidationSchema,
} = require("../../middleware/DataValidator");
// POST // api/reservations
router.post(
  "/reservations",
  languageMiddleware,
  reservationValidationSchema,
  (req, res) => new ReservationController(req, res).addReservation()
);

// GET // api/reservations
router.get(
  "/getAllReservations",
  languageMiddleware,
  auth.isAuthenticated,
  (req, res) => new ReservationController(req, res).getReservations()
);

module.exports = router;
