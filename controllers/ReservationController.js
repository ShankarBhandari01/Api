import BaseController from "../controllers/BaseController.js";

class ReservationController extends BaseController {
  constructor({
    req,
    res,
    reservationService,
    emailService,
    firebasePushNotificationService,
  }) {
    super(req, res);
    this.reservationService = reservationService;
    this.emailService = emailService;
    this.firebasePushNotificationService = firebasePushNotificationService;
  }

  // Add Reservation
  addReservation = async () => {
    await this.runServiceMethod(
      this.reservationService,
      async (service) => {
        const response = await service.addReservation(this.req.body);
        // After successful reservation, send booking confirmation and push notification
        await emailService.sendBookingConfirmation(response.data);
        await firebasePushNotificationService.sendPushNotificationToAll(
          response.data
        );
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
        this.reservationService,
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

export default ReservationController;
