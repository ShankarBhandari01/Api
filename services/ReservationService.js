import BaseService from "./BaseService.js";
import ReservationRepository from "../repositories/ReservationRepository.js";

class ReservationService extends BaseService {
  constructor(connection) {
    super(connection);
    this.connection = connection;
    this.reservationRepository = new ReservationRepository(connection);
  }

  addReservation = async (newReservation) => {
    return await this.handleRepositoryCall(
      this.reservationRepository.addReservation,
      newReservation
    );
  };
  getAllReservation = async (filters) => {
    try {
      const {
        page = 1,
        limit = 10,
        searchText = "",
        isTodayReservations,
      } = filters;

      const skip = this.getSkipNumber(page, limit);

      // Fetch reservations and total count
      const [reservations, totalCount] = await Promise.all([
        this.reservationRepository.getReservations(
          skip,
          limit,
          isTodayReservations
        ),
        this.reservationRepository.getReservationCount(),
      ]);

      // Format the response
      const response = super.prepareResponse(reservations, "reservations");

      if (Array.isArray(reservations) && reservations.length > 0) {
        response.pagination = {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
        };
      }

      return response;
    } catch (error) {
      throw { message: error.message };
    }
  };
}

export default ReservationService;
