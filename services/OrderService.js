import BaseService from "./BaseService.js";
import OrderDTO from "../dtos/OrderDto.js";

class OrderService extends BaseService {
  constructor({
    connection,
    orderRepository,
    redisSocketService,
    emailService,
    rabbitMQ
  }) {
    super(connection);
    this.connection = connection;
    this.orderRespository = orderRepository;
    this.redisSocketService = redisSocketService;
    this.emailService = emailService;
    this.rabbitMQ = rabbitMQ
  }

  // testing rabbitmq this will send message to spring boot api
  testRabitmqOrders = async (orders) => {
    try {
      // publish message 
      await this.rabbitMQ.publish("order_queue", orders)
    } catch (error) {
      this.logAndThrowError("rabitmq error saving order", error);
    }
  }

  // this function handle orders from users 
  saveOrders = async (orders, lang) => {
    try {
      // const companyInfo = await this.companyRepository.getCompanyInfo();
      // const openingHours = companyInfo.openingHours;
      // validate opening hours
      // this.validationOpeningHour(openingHours);

      const dto = new OrderDTO(orders);
      // fetch active vat rates
      const vartRates = await this.getActiveVatRates();
      if (!vartRates) {
       // throw new Error("No active VAT rate found");
        dto.vatPercent = 13.5; // default vat percent
      }else{
        // set vat percent from active vat rates for reduced category i.e food items
        dto.vatPercent = vartRates.vatRates.find(rate => rate.category === 'REDUCED')?.rate || 13.5;
      }
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
            `Price mismatch for item '${savedItem.stockName.fi} ' (expected: ${reqItem.pricePerItem} actual: ${savedItem.amount})`
          );
        }
        reqItem.name = savedItem.stockName;
      });
      // total ordered quantity
      orders.orderQuantity = dto.getOrderQuantity();
      // set vat amount
      orders.vatAmount = dto.getVATAmountIncluded();
      // set total amount excluding vat
      orders.subtotal = dto.getSubtotalExcludingVAT();
      // set vat percent
      orders.vatPercent = dto.vatPercent;
      // round total amount
      orders.totalAmount = parseFloat(orders.totalAmount.toFixed(2));

      // total amount including vat
      if (orders.totalAmount !== dto.getCalculatedTotal()) {
        throw new Error(
          `Total amount mismatch (expected: ${dto.getCalculatedTotal()} actual: ${orders.totalAmount
          })`
        );
      }
      // set total amount
      orders.totalAmount = dto.getCalculatedTotal();

      const savedOrder = await this.orderRespository.saveOrder(orders);
      await this.redisSocketService.delCacheKey("order:*");

      // send confirmation emails to customer
      this.emailService.sendOrderPlaceConfirmation(savedOrder);
      // send notification to admins
      this.emailService.sendOrderNotificationEmailToAdmin(savedOrder);

      // send response to user
      return super.prepareResponse(savedOrder);
    } catch (error) {
      this.logAndThrowError("Error saving order", error);
    }
  };

  getOrderStatus = async (order_id) => {
    try {
      const cacheKey = `order:status:${order_id}`;
      const cached = await this.redisSocketService.getCacheValue(cacheKey);
      if (cached) return cached;

      const result = await this.orderRespository.getOrderByOrderId(
        order_id,
        true
      );
      const response = super.prepareResponse(result);
      await this.redisSocketService.setCacheValue(cacheKey, response);
      return response;
    } catch (error) {
      this.logAndThrowError("Error getting order status", error);
    }
  };

  updateOrderStatus = async (order_id, status, time, reason) => {
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
      } else if ((!time || isNaN(time) || time < 0) && status == "accepted") {
        throw new Error("Invalid time");
      }
      const order = await this.orderRespository.getOrderByOrderId(order_id);
      if (order === null || order.length == 0) {
        throw new Error("Order not found");
      }

      order.status = status; // update status
      // Only set time in accepted orders only
      if (status == "accepted") {
        order.pareparingTime = Number.parseInt(time);
      }
      // Check if the status is "cancelled" or "rejected"
      if (status === "cancelled" || "rejected") {
        order.reason = reason;
      }
      const updatedOrder = await this.orderRespository.saveOrder(order, true);

      await this.redisSocketService.delCacheKey("order:*");
      // send updates emails
      this.emailService.sendOrderPlaceConfirmation(updatedOrder);

      return super.prepareResponse(updatedOrder);
    } catch (error) {
      this.logAndThrowError("Error saving order", error);
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

      // grouping order by status and count them up
      response.countByStatus = await this.orderRespository.countOrderBystatus();

      await this.redisSocketService.setCacheValue(cacheKey, response);
      return response;
    } catch (error) {
      this.logAndThrowError("Validation error saving order", error);
    }
  };
}
export default OrderService;
