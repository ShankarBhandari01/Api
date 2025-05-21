import BaseController from "./BaseController.js";

class OrderController extends BaseController {
  constructor({ req, res, orderService, firebasePushNotificationService }) {
    super(req, res);
    this.orderService = orderService;
    this.firebasePushNotificationService = firebasePushNotificationService;
  }

  saveOrder = async () => {
    await this.runServiceMethod(
      this.orderService,
      async (service) => {
        const response = await service.saveOrders(this.req.body, this.lang);
        // Send push notification to all admins
        await this.firebasePushNotificationService.sendPushNotificationToAdminsOnNewOrder(
          response.data
        );
        return response;
      },
      "Order place successfully"
    );
  };
  getOrderStatus = async () => {
    const { orderId } = this.req.params;
    await this.runServiceMethod(
      this.orderService,
      async (service) => {
        const response = await service.getOrderStatus(orderId);
        return response;
      },
      "Order status fetched successfully"
    );
  };

  getOrdersBystatus = async (status) => {
    await this.runServiceMethod(
      this.orderService,
      async (service) => {
        const response = await service.getOrdersByStatus(status, this.lang);
        return response;
      },
      "Orders by status successfully"
    );
  };

  updateStatus = async () => {
    const { orderId } = this.req.params;
    const { status, time, reason } = this.req.body;
    await this.runServiceMethod(
      this.orderService,
      async (service) => {
        const response = await service.updateOrderStatus(
          orderId,
          status,
          time,
          reason
        );

        await this.firebasePushNotificationService.sendSocketioNotification(
          response.data,
          orderId,
          "orderStatusUpdate"
        );
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
      this.orderService,
      async (service) => {
        const response = await service.getOrderByStatusOrAll(filters);
        return response;
      },
      "Order by status or all successfully"
    );
  };
}
export default OrderController;
