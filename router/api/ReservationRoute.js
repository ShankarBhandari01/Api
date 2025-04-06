const express = require("express");
const router = express.Router();
const {languageMiddleware} = require("../../middleware/languageMiddleware");
const ReservationController = require("../../controllers/ReservationController");

router.post("/reservations", languageMiddleware, async (req, res, next) => {
    try {
        const controller = new ReservationController(req, res);
        await controller.addReservation();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
