import BaseController from "../controllers/BaseController.js";

class ReservationController extends BaseController {
  constructor({
    req,
    res,
    reservationService,
    firebasePushNotificationService,
  }) {
    super(req, res);
    this.reservationService = reservationService;
    this.firebasePushNotificationService = firebasePushNotificationService;
  }

  // Add Reservation
  addReservation = async () => {
    await this.runServiceMethod(
      this.reservationService,
      async (service) => {
        const response = await service.addReservation(this.req.body);
        await this.firebasePushNotificationService.sendPushNotificationToAll(
          response.data
        );
        return response;
      },
      "Reservation added successfully"
    );
  };

  // Update Reservation Status
  updateReservationStatus = async () =>
    await this.runServiceMethod(
      this.reservationService,
      async (service) => {
        const reservationId = this.req.params.reservationId;
        const status = this.req.body.status;
        const response = await service.updareReservationStatus(
          reservationId,
          status
        );
        return response;
      },
      "Reservation status updated successfully"
    );

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

  // Send Socket.io Notification
  sendNotification = async () => {
    await this.firebasePushNotificationService.sendSocketioNotification(
      this.req.body,
      "abc123",
      "orderStatusUpdate"
    );
  };
}

export default ReservationController;
