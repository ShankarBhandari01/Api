const BaseRepo = require("./BaseRepository");
const {Table} = require("../model/Reservation");
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
            throw new DatabaseError(`Error retrieving user by email: ${error.message}`);
        }
    }

    getAllReservations = async () => {
        return await this.reservation.find().lean()
    }

}

module.exports = ReservationRepository;