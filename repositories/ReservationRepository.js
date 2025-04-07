const BaseRepo = require("./BaseRepository");
const {Table} = require("../models/Reservation");
const {DatabaseError} = require("../utils/errors");

class ReservationRepository extends BaseRepo {
    constructor(reservation) {
        super();
        this.reservation = reservation;
    }

    /**
     * Adds a reservation to the database and assigns a table to it.
     * @param {Object} reservation - The reservation data to be saved.
     * @returns {Promise} Resolves with the saved reservation data.
     * @throws {DatabaseError} Throws an error if something goes wrong.
     */
    addReservation = async (reservation) => {
        try {
            const table = await Table.findOne().sort({_id: 1}).lean();
            if (!table) {
                throw new DatabaseError('No available tables found.');
            }
            reservation.table_id = table._id;
            return await this.reservation.create(reservation);
        } catch (error) {
            throw new DatabaseError(`Error retrieving tables: ${error.message}`);
        }
    }

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

        return await this.reservation
            .find(query) // Apply the filter based on the query
            .sort({reservation_date: -1}) // Sort by reservation date
            .skip(skip)
            .limit(limit)
            .lean();
    };


    getReservationCount = async () => {
        return await this.reservation.countDocuments();
    };

}

module.exports = ReservationRepository;