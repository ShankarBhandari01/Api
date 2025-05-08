import { isWeekend } from "date-fns";
import * as dateFnsTz from "date-fns-tz";
const { formatInTimeZone, zonedTimeToUtc } = dateFnsTz;
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

      const utcDate = new Date(newReservation.reservation_date);
      const finlandTime = formatInTimeZone(
        utcDate,
        "Europe/Helsinki",
        "yyyy-MM-dd HH:mm:ss zzz"
      );

      const isWeekendDay = isWeekend(finlandTime);
      const hoursRange = isWeekendDay
        ? openingHours.weekends
        : openingHours.weekdays;

      const [openTime, closeTime] = hoursRange.replace(/\s/g, "").split("–");
      const [openHour, openMin] = openTime.split(":").map(Number);
      const [closeHour, closeMin] = closeTime.split(":").map(Number);

      const openingDateTime = new Date(finlandTime);
      openingDateTime.setHours(openHour, openMin, 0, 0);

      const closingDateTime = new Date(finlandTime);
      closingDateTime.setHours(closeHour, closeMin, 0, 0);

      // Subtract 15 minutes from closing time
      const latestReservationTime = new Date(
        closingDateTime.getTime() - 15 * 60000
      );

      if (
        finlandTime < openingDateTime ||
        finlandTime > latestReservationTime
      ) {
        throw {
          message: `Reservation must be between ${openTime} and ${closeTime}, and at least 15 minutes before closing time.`,
        };
      }

      const result = await this.reservationRepository.addReservation(
        newReservation
      );

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
