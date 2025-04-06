const BaseController = require("../controllers/BaseController");
const ReservationService = require("../services/ReservationService");
const { Reservation, Table } = require("../model/Reservation");
const ReservationRepository = require("../repositories/ReservationRepository");
const service = require("./ReservationController");

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
}

module.exports = ReservationController;
