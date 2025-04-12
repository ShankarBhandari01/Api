const BaseService = require("./BaseService");
const OrderRespository = require("../repositories/OrderRepository");

class OrderService extends BaseService {
  constructor(connection) {
    super(connection);
    this.connection = connection;
    this.orderRespository = new OrderRespository(connection);
  }
}
module.exports = OrderService;
