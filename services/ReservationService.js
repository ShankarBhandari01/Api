import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { isWeekend } from "date-fns";
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

  checkWeekday = () => {
    const today = new Date();
    const day = today.getDay();
    return day !== 0 && day !== 6;
  };

  addReservation = async (newReservation) => {
    try {
      const companyInfo = await this.companyRepository.getCompanyInfo();
      const openingHours = companyInfo.openingHours;

      // Parse the UTC reservation date from the request
      const reservationUTC = new Date(newReservation.reservation_date);

      // Convert to Finland time zone
      const reservationFinland = toZonedTime(reservationUTC, "Europe/Helsinki");

      // Determine if the reservation date is a weekend in Finland
      const isWeekendDay = isWeekend(reservationFinland);
      const hoursRange = isWeekendDay
        ? openingHours.weekends
        : openingHours.weekdays;

      // Extract opening and closing times (e.g. "11:00–22:00")
      const [openTime, closeTime] = hoursRange.replace(/\s/g, "").split("–");
      const [openHour, openMin] = openTime.split(":").map(Number);
      const [closeHour, closeMin] = closeTime.split(":").map(Number);

      // Create opening and closing Date objects in Finland time
      const openingDateTime = new Date(reservationFinland);
      openingDateTime.setHours(openHour, openMin, 0, 0);

      const closingDateTime = new Date(reservationFinland);
      closingDateTime.setHours(closeHour, closeMin, 0, 0);

      // Latest allowed reservation time (15 minutes before closing)
      const latestReservationTime = new Date(
        closingDateTime.getTime() - 15 * 60 * 1000
      );

      // Validate reservation time
      if (
        reservationFinland < openingDateTime ||
        reservationFinland > latestReservationTime
      ) {
        throw new Error(
          `Reservation must be between ${openTime} and ${closeTime}, and at least 15 minutes before closing.`
        );
      }

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
