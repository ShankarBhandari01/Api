const BaseService = require("./BaseService");

class ReservationService extends BaseService {
  constructor(reservationRepository) {
    super();
    this.reservationRepository = reservationRepository;
  }

  addReservation = async (newReservation) => {
    try {
      const response = await this.reservationRepository.addReservation(
        newReservation
      );
      return super.prepareResponse(response);
    } catch (error) {
      throw { message: error.message };
    }
  };
}

module.exports = ReservationService;
