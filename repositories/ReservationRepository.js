const BaseRepo = require("./BaseRepository");
const { DatabaseError } = require("../utils/errors");
const Reservation = require("../models/Reservation");

class ReservationRepository extends BaseRepo {
  constructor(connection) {
    super(connection);
    this.connection = connection;
    this.reservationModel = Reservation(connection).ReservationModel;
    this.tableModel = Reservation(connection).TableModel;
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
      throw new DatabaseError(`Error retrieving tables: ${error.message}`);
    }
  };

  getReservations = async (skip = 0, limit = 10, filterToday = false) => {
    let query = {};

    if (filterToday) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0); // Start of today

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999); // End of today

      query = {
        reservation_date: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      };
    }

    return await this.reservationModel
      .find(query)
      .populate("table_id")
      .sort({ reservation_date: -1 }) // Sort by reservation date
      .skip(skip)
      .limit(limit)
      .lean();
  };

  getReservationCount = async () => {
    return await this.reservationModel.countDocuments();
  };
}

module.exports = ReservationRepository;
