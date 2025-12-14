import BaseService from "./BaseService.js";
import { fillMissingDates } from "../utils/common.js"

class ReportingService extends BaseService {
  constructor({
    connection,
    reportRepository,
    redisSocketService,
    orderRepository,
    reservationRepository
  }) {
    super(connection)
    this.connection = connection;
    this.reportRepository = reportRepository;
    this.redisSocketService = redisSocketService;
    this.orderRepository = orderRepository;
    this.reservationRepository = reservationRepository
  }
  async countSalesCounts() {
    return await this.orderRepository.countSales()
  }
  async sumTotalSales() {
    return await this.orderRepository.sumSales()
  }

  async totalReservations() {
    return await this.reservationRepository.countAll()
  }

  async todaysReservations() {
    return await this.reservationRepository.countTodays()
  }
  async countRecevedToday() {
    return await this.reservationRepository.countRecivedTodays()
  }

  async pendingReservations() {
    return await this.reservationRepository.countByStatus("Pending")
  }

  async orderChart(range) {
    return await this.orderRepository.salesGroupedByDate(range)
  }

  async reservationChart(range) {
    return await this.reservationRepository.countGroupedByDate(range)
  }

  async getCompanyReport(range = "30d") {
    const [
      countSales,
      totalSales,
      totalReservations,
      todaysReservation,
      countRecevedToday,
      pendingReservations,
      orderChart,
      reservationChart
    ] = await Promise.all([
      this.countSalesCounts(),
      this.sumTotalSales(),
      this.totalReservations(),
      this.todaysReservations(),
      this.countRecevedToday,
      this.pendingReservations(),
      this.orderChart(range),
      this.reservationChart(range)
    ]);

    // do data filling park in analysis part in frontend 
    //const orderFilled = fillMissingDates(orderChart, range)
    //const reservationFillted = fillMissingDates(reservationChart, range)

    const results = {
      countSales,
      totalSales,
      totalReservations,
      todaysReservation,
      countRecevedToday,
      pendingReservations,
      charts: {
        orders: orderChart,
        reservations: reservationChart
      }
    };

    return results
  }

}
export default ReportingService