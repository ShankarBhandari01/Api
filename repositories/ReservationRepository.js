import BaseRepo from "./BaseRepository.js";
import { DatabaseError } from "../utils/errors.js";
import Reservation from "../models/Reservation.js";
import { getStartdayEndDay } from "../utils/dateFormatter.js"

class ReservationRepository extends BaseRepo {
  constructor({ connection }) {
    super(connection);
    this.connection = connection;
    this.reservationModel = Reservation(connection).ReservationModel;
    this.tableModel = Reservation(connection).TableModel;
  }

  async countAll() {
    return await this.reservationModel.countDocuments();
  }

  // this return the count of reservation booked for today
  async countTodays() {
    const { start, end } = getStartdayEndDay()
    return this.reservationModel.countDocuments({
      reservation_date: { $gte: start, $lte: end },
    });
  }

  // this return the count of reservation received today
  async countRecivedTodays() {
    const { start, end } = getStartdayEndDay()

    return this.reservationModel.countDocuments({
      createdDate: { $gte: start, $lte: end },
    });
  }

  async countByStatus(status) {
    return this.reservationModel.countDocuments({ status });
  }

  async countGroupedByDate(range = "30d") {
    const days = parseInt(range.replace("d", ""));

    const start = new Date();
    start.setDate(start.getDate() - days);

    const result = await this.reservationModel.aggregate([
      { $match: { createdDate: { $gte: start } } },

      {
        $group: {
          _id: {
            year: { $year: "$createdDate" },
            month: { $month: "$createdDate" },
            day: { $dayOfMonth: "$createdDate" },
          },
          count: { $sum: 1 },
        },
      },

      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
          count: 1,
        },
      },

      { $sort: { date: 1 } },
    ]);

    return result;
  }


  /**
   * Adds a reservation to the database and assigns a table to it.
   * @param {Object} reservation - The reservation data to be saved.
   * @returns {Promise} Resolves with the saved reservation data.
   * @throws {DatabaseError} Throws an error if something goes wrong.
   */
  addReservation = async (reservation) => {
    try {
      const table = await this.tableModel.findOne().sort({ _id: 1 }).lean();
      if (!table) {
        throw new DatabaseError("No available tables found.");
      }
      reservation.table_id = table._id;
      return await this.reservationModel.create(reservation);
    } catch (error) {
      this.logAndThrowError(error.message, error);
    }
  };

  getReservationById = async (reservationId) => {
    try {
      const reservation = await this.reservationModel
        .findOne({ _id: reservationId })
        .populate("table_id")
        .lean();
      return reservation;
    } catch (error) {
      this.logAndThrowError("Failed to fetch reservation by ID", error);
    }
  };

  updateReservation = async (reservation) => {
    try {
      return await this.reservationModel.findByIdAndUpdate(
        reservation._id,
        reservation,
        { new: true, runValidators: true }
      );
    } catch (error) {
      this.logAndThrowError("Failed to update reservation", error);
    }
  };

  getReservations = async (
    skip = 0,
    limit = 10,
    isTodayReservations = false,
    filterUpcoming = false,
    filterPast = false,
    date_range = null
  ) => {
    try {

      const { start, end } = getStartdayEndDay()
      const startOfDay = start
      const endOfDay = end

      let query = {};

      if (isTodayReservations) {
        query = {
          reservation_date: { $gte: startOfDay, $lt: endOfDay },
        };
      } else if (filterUpcoming) {
        query = {
          reservation_date: { $gt: endOfDay },
        };
      } else if (filterPast) {
        query = {
          reservation_date: { $lt: startOfDay },
        };
      } else if (date_range) {
        query = {
          reservation_date: {
            $gte: new Date(date_range.startDate),
            $lt: new Date(date_range.endDate),
          },
        };
      }

      if (isTodayReservations || filterUpcoming || filterPast || date_range) {
        return await this.reservationModel
          .find(query)
          .populate("table_id")
          .sort({ reservation_date: 1 })
          .skip(skip)
          .limit(limit)
          .lean();
      }

      // Default: mixed list with today's first
      const results = await this.reservationModel.aggregate([
        {
          $addFields: {
            isToday: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$reservation_date", startOfDay] },
                    { $lt: ["$reservation_date", endOfDay] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
        { $sort: { isToday: -1, reservation_date: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);

      return results;
    } catch (error) {
      this.logAndThrowError("Failed to fetch reservations", error);
    }
  };

  getReservationCount = async (
    isTodayReservations = false,
    filterUpcoming = false,
    filterPast = false,
    date_range = null
  ) => {
    const { start, end } = getStartdayEndDay()
    const startOfDay = start
    const endOfDay = end


    let query = {};

    if (isTodayReservations) {
      query = {
        reservation_date: { $gte: startOfDay, $lt: endOfDay },
      };
    } else if (filterUpcoming) {
      query = {
        reservation_date: { $gt: endOfDay },
      };
    } else if (filterPast) {
      query = {
        reservation_date: { $lt: startOfDay },
      };
    } else if (date_range) {
      query = {
        reservation_date: {
          $gte: new Date(date_range.startDate),
          $lt: new Date(date_range.endDate),
        },
      };
    }

    return await this.reservationModel.countDocuments(query);
  };
}

export default ReservationRepository;
