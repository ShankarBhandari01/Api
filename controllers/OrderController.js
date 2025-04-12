const BaseController = require("./BaseController");
const { OrderService } = require("../services/OrderService");
const FirebasePushNotificationService = require("../services/FirebasePushNotificationService");

class OrderController extends BaseController {
  constructor(req, res) {
    super(req, res);
  }

  saveOrder = async () => {
    await this.runServiceMethod(
      OrderService,
      async (service) => {
        const response = await service.saveOrders(this.req.body, this.lang);
        await new FirebasePushNotificationService(
          await this.getDbConnection()
        ).sendPushNotificationToAdminsOnNewOrder(response.data);

        return response;
      },
      "Order place successfully"
    );
  };

  getOrdersBystatus = async (status) => {
    await this.runServiceMethod(
      OrderService,
      async (service) => {
        const response = await service.getOrdersByStatus(status, this.lang);
        return response;
      },
      "Orders by status successfully"
    );
  };

  updateStatus = async () => {
    const { order_id, status } = this.req.params;
    await this.runServiceMethod(
      OrderService,
      async (service) => {
        const response = await service.updateOrderStatus(order_id, status);
        // TODO send message to user about status of orders
        return response;
      },
      "Order status updated successfully"
    );
  };
  getOrderByStatusOrAll = async () => {
    const search = this.req.query.search || "";
    const status = this.req.query.status || "";

    // Get pagination parameters from query
    const page = parseInt(this.req.query.page) || 1;
    const limit = parseInt(this.req.query.limit) || 10;
    const sort = this.req.query.sort || "asc";
    const sortBy = this.req.query.sortBy || "id";

    const filters = {
      status,
      search,
      page,
      limit,
      sort,
      sortBy,
    };

    await this.runServiceMethod(
      OrderService,
      async (service) => {
        const response = await service.getOrderByStatusOrAll(filters);
        return response;
      },
      "Order by status or all successfully"
    );
  };
}
module.exports = OrderController;
