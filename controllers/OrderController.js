import BaseController from "./BaseController.js";
import OrderService from "../services/OrderService.js";
import FirebasePushNotificationService from "../services/FirebasePushNotificationService.js";
import OrderRespository from "../repositories/OrderRepository.js";
import NotificationRepository from "../repositories/NotificationRepository.js";

class OrderController extends BaseController {
  constructor(req, res) {
    super(req, res);
  }

  saveOrder = async () => {
    await this.runServiceMethod(
      OrderService,
      { OrderRespository: OrderRespository },
      async (service, connection) => {
        const response = await service.saveOrders(this.req.body, this.lang);
        await new FirebasePushNotificationService(connection, {
          NotificationRepository: new NotificationRepository(connection),
        }).sendPushNotificationToAdminsOnNewOrder(response.data);

        return response;
      },
      "Order place successfully"
    );
  };
  getOrderStatus = async () => {
    const { orderId } = this.req.params;
    await this.runServiceMethod(
      OrderService,
      { OrderRespository: OrderRespository },
      async (service) => {
        const response = await service.getOrderStatus(orderId);
        return response;
      },
      "Order status fetched successfully"
    );
  };

  getOrdersBystatus = async (status) => {
    await this.runServiceMethod(
      OrderService,
      { OrderRespository: OrderRespository },
      async (service) => {
        const response = await service.getOrdersByStatus(status, this.lang);
        return response;
      },
      "Orders by status successfully"
    );
  };

  updateStatus = async () => {
    const { orderId, status } = this.req.params;
    await this.runServiceMethod(
      OrderService,
      { OrderRespository: OrderRespository },
      async (service) => {
        const response = await service.updateOrderStatus(orderId, status);
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
    const sortBy = this.req.query.sortBy || "createdDate";

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
      { OrderRespository: OrderRespository },
      async (service) => {
        const response = await service.getOrderByStatusOrAll(filters);
        return response;
      },
      "Order by status or all successfully"
    );
  };
}
export default OrderController;
