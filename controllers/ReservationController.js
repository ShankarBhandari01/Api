const BaseController = require("../controllers/BaseController");
const ReservationService = require("../services/ReservationService");
const { Reservation } = require("../models/Reservation");
const ReservationRepository = require("../repositories/ReservationRepository");

const reservationRepository = new ReservationRepository(Reservation);
const Service = new ReservationService(reservationRepository);

const { EmailService } = require("../services/EmailService");

class ReservationController extends BaseController {
  constructor(req, res) {
    super(req, res);
  }

  addReservation = async () => {
    try {
      const response = await Service.addReservation(this.req.body);
      this.sendResponse(response, "success");
      await new EmailService().sendBookingConfirmation(response.data);
    } catch (error) {
      this.sendError(error);
    }
  };

  getReservations = async () => {
    try {
      const page = parseInt(this.req.query.page) || 1;
      const limit = parseInt(this.req.query.limit) || 10;
      const searchText = this.req.query.search || "";
      const isTodayReservations = this.req.query.isTodayReservations || false;

      const searchFilters = {
        searchText,
        page,
        limit,
        isTodayReservations,
      };
      const response = await Service.getAllReservation(searchFilters);
      this.sendResponse(response, "success");
    } catch (error) {
      this.sendError(error);
    }
  };
}

module.exports = ReservationController;
