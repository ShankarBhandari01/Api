const BaseRepo = require("./BaseRepository");
const Orders = require("../models/Orders");
const Products = require("../models/Stocks");
class OrderRespository extends BaseRepo {
  constructor(connection) {
    super(connection);
    // registering models in connection
    this.order = Orders(connection).OrderModel;
    this.customer = Orders(connection).CustomerModel;
    this.item = Products(connection).Stock;
    this.category = Products(connection).Category;
  }
}
module.exports = OrderRespository;
