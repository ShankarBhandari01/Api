const express = require("express");
const router = express.Router();
const { languageMiddleware } = require("../../middleware/languageMiddleware");
const ReservationController = require("../../controllers/ReservationController");
const auth = require("../../middleware/auth"); //middleware for varifying user

router.post("/reservations", languageMiddleware, async (req, res, next) => {
  try {
    const controller = new ReservationController(req, res);
    await controller.addReservation();
  } catch (error) {
    next(error);
  }
});

// GET /reservations
router.get(
  "/getAllReservations",
  languageMiddleware,
  auth.isAuthunticated,
  async (req, res, next) => {
    try {
      const controller = new ReservationController(req, res);
      await controller.getReservations();
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
