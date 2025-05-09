import BaseService from "./BaseService.js";

class ReservationService extends BaseService {
  constructor({
    connection,
    reservationRepository,
    redisSocketService,
    companyRepository,
  }) {
    super(connection);
    this.connection = connection;
    this.reservationRepository = reservationRepository;
    this.redisSocketService = redisSocketService;
    this.companyRepository = companyRepository;
  }

  addReservation = async (newReservation) => {
    try {
      const companyInfo = await this.companyRepository.getCompanyInfo();
      const openingHours = companyInfo.openingHours;

      // Check if the reservation is within the opening hours
      this.validationOpeningHour(
        openingHours,
        newReservation.reservation_date,
        false
      );

      // Proceed with saving the reservation
      const result = await this.reservationRepository.addReservation(
        newReservation
      );

      // Invalidate Redis cache for reservations
      await this.redisSocketService.delCacheKey("reservation:*");

      return super.prepareResponse(result);
    } catch (error) {
      // Log the error for debugging purposes
      console.error("Error adding reservation:", error);
      throw { message: error.message, stack: error.stack };
    }
  };

  getAllReservation = async (filters) => {
    try {
      const {
        page = 1,
        limit = 10,
        searchText = "", // (currently unused, preserved for future use)
        isTodayReservations = false,
      } = filters;

      const skip = this.getSkipNumber(page, limit);
      const cacheKey = `reservation:all:page:${page}:limit:${limit}:today:${isTodayReservations}`;

      //  Check cache
      const cached = await this.redisSocketService.getCacheValue(cacheKey);
      if (cached) return cached;

      const [reservations, totalCount] = await Promise.all([
        this.reservationRepository.getReservations(
          skip,
          limit,
          isTodayReservations
        ),
        this.reservationRepository.getReservationCount(),
      ]);

      const response = super.prepareResponse(reservations, "reservations");

      if (Array.isArray(reservations) && reservations.length > 0) {
        response.pagination = {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
        };
      }

      // Cache the result
      await this.redisSocketService.setCacheValue(cacheKey, response, 60);

      return response;
    } catch (error) {
      throw { message: error.message, stack: error.stack };
    }
  };
}

export default ReservationService;
