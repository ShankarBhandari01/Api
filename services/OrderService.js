import BaseService from "./BaseService.js";
import OrderDTO from "../dtos/OrderDto.js";

class OrderService extends BaseService {
  constructor({
    connection,
    orderRepository,
    redisSocketService,
    companyRepository,
  }) {
    super(connection);
    this.connection = connection;
    this.orderRespository = orderRepository;
    this.redisSocketService = redisSocketService;
    this.companyRepository = companyRepository;
  }

  saveOrders = async (orders, lang) => {
    try {
      // const companyInfo = await this.companyRepository.getCompanyInfo();
      // const openingHours = companyInfo.openingHours;
      // validate opening hours
      // this.validationOpeningHour(openingHours);

      const dto = new OrderDTO(orders);
      dto.validate();
      const { customer, items } = dto;

      const checkCustomer = await this.orderRespository.checkCustomerSave(
        customer
      );
      if (!checkCustomer) throw new Error("Customer does not exist");

      orders.customer = checkCustomer._id;
      const itemIds = items.map((i) => i.item);
      const savedItems = await this.orderRespository.getOrderItems(itemIds);

      if (!savedItems || savedItems.length !== itemIds.length) {
        throw new Error("One or more items not found in database");
      }

      items.forEach((reqItem) => {
        const savedItem = savedItems.find(
          (dbItem) => dbItem._id.toString() === reqItem.item
        );
        if (!savedItem) {
          throw new Error(`Item not found in database itemId: ${reqItem.item}`);
        }
        if (!savedItem.isActive || savedItem.isDeleted) {
          throw new Error(
            `Item '${savedItem.stockName.fi}' is currently unavailable`
          );
        }
        if (savedItem.amount !== reqItem.pricePerItem) {
          throw new Error(
            `Price mismatch for item '${savedItem.stockName.fi}'`
          );
        }
        reqItem.totalPrice = parseFloat(
          (reqItem.pricePerItem * reqItem.quantity).toFixed(2),
          0
        );
        reqItem.name = savedItem.stockName;
      });

      orders.totalAmount = dto.getCalculatedTotal();
      orders.orderQuantity = dto.getOrderQuantity();

      const savedOrder = await this.orderRespository.saveOrder(orders);
      await this.redisSocketService.delCacheKeyMatching("order:*");

      return super.prepareResponse(savedOrder);
    } catch (error) {
      this.logAndThrowError("Validation error saving order", error);
    }
  };

  getOrderStatus = async (order_id) => {
    try {
      const cacheKey = `order:status:${order_id}`;
      const cached = await this.redisSocketService.getCacheValue(cacheKey);
      if (cached) return cached;

      const result = await this.orderRespository.getOrderByOrderId(order_id);
      const response = super.prepareResponse(result);
      await this.redisSocketService.setCacheValue(cacheKey, response);
      return response;
    } catch (error) {
      this.logAndThrowError("Error getting order status", error);
    }
  };

  updateOrderStatus = async (order_id, status) => {
    try {
      const validStatuses = [
        "pending",
        "processing",
        "rejected",
        "accepted",
        "completed",
        "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
      }
      const order = await this.orderRespository.getOrderByOrderId(order_id);
      if (order.length == 0) {
        throw new Error("Order not found");
      }
      order.status = status;
      const updatedOrder = await this.orderRespository.saveOrder(order, true);
      await this.redisSocketService.delCacheKeyMatching("order:*");
      return super.prepareResponse(updatedOrder);
    } catch (error) {
      this.logAndThrowError("Validation error saving order", error);
    }
  };

  getOrderByStatusOrAll = async (filter) => {
    try {
      filter.skip = this.getSkipNumber(filter.page, filter.limit);
      const cacheKey = `order:filter:${JSON.stringify(filter)}`;
      const cached = await this.redisSocketService.getCacheValue(cacheKey);
      if (cached) return cached;

      const [Orders, total] = await Promise.all([
        this.orderRespository.getOrderOrSearch(filter),
        this.orderRespository.countOrders(filter),
      ]);

      const response = super.prepareResponse(Orders, "Orders");
      if (Array.isArray(Orders) && Orders.length > 0) {
        response.pagination = {
          currentPage: filter.page,
          totalPages: Math.ceil(total / filter.limit),
          totalCount: total,
        };
      }

      await this.redisSocketService.setCacheValue(cacheKey, response);
      return response;
    } catch (error) {
      this.logAndThrowError("Validation error saving order", error);
    }
  };
}
export default OrderService;
