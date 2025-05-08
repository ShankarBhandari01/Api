import BaseService from "./BaseService.js";

class ReservationService extends BaseService {
  constructor({ connection, reservationRepository, redisSocketService }) {
    super(connection);
    this.connection = connection;
    this.reservationRepository = reservationRepository;
    this.redisSocketService = redisSocketService;
  }

  addReservation = async (newReservation) => {
    try {
      const result = await this.reservationRepository.addReservation(
        newReservation
      );

      // Invalidate all cached reservations
      await this.redisSocketService.delCacheKey("reservation:*");

      return super.prepareResponse(result);
    } catch (error) {
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
