const BaseController = require("../controllers/BaseController");
const ReservationService = require("../services/ReservationService");
const FirebasePushNotificationService = require("../services/FirebasePushNotificationService");
const { EmailService } = require("../services/EmailService");

class ReservationController extends BaseController {
  constructor(req, res) {
    super(req, res);
  }

  // Add Reservation
  addReservation = async () => {
    await this.runServiceMethod(
      ReservationService,
      async (service) => {
        const response = await service.addReservation(this.req.body);

        // After successful reservation, send booking confirmation and push notification
        await new EmailService().sendBookingConfirmation(response.data);
        await new FirebasePushNotificationService(
          await this.getDbConnection()
        ).sendPushNotificationToAll(response.data);

        return response;
      },
      "Reservation added successfully"
    );
  };

  // Get Reservations
  getReservations = async () => {
    try {
      const page = parseInt(this.req.query.page) || 1;
      const limit = parseInt(this.req.query.limit) || 10;
      const searchText = this.req.query.search || "";
      let isTodayReservations = this.req.query.isTodayReservations === "true";

      // Validate limit to prevent excessive data retrieval
      if (limit >= 100) {
        throw { message: "Limit must be less than 100" };
      }

      const searchFilters = { searchText, page, limit, isTodayReservations };

      await this.runServiceMethod(
        ReservationService,
        async (service) => {
          return await service.getAllReservation(searchFilters);
        },
        "Reservations fetched successfully"
      );
    } catch (error) {
      this.sendError(error);
    }
  };
}

module.exports = ReservationController;
