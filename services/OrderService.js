import BaseService from "./BaseService.js";
import OrderRespository from "../repositories/OrderRepository.js";
import OrderDTO from "../dtos/OrderDto.js";

class OrderService extends BaseService {
  constructor(connection) {
    super(connection);
    this.connection = connection;
    this.orderRespository = new OrderRespository(connection);
  }

  saveOrders = async (orders, lang) => {
    try {
      const dto = new OrderDTO(orders);
      dto.validate();
      const { customer, items } = dto;
      //Check if customer exists
      const checkCustomer = await this.orderRespository.checkCustomerSave(
        customer
      );
      if (!checkCustomer) throw new Error("Customer does not exist");

      orders.customer = checkCustomer._id; // Reference valid ID
      //Extract unique item IDs
      const itemIds = items.map((i) => i.item);
      const savedItems = await this.orderRespository.getOrderItems(itemIds);

      if (!savedItems || savedItems.length !== itemIds.length) {
        throw new Error("One or more items not found in database");
      }

      //Verify each item from DB
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
        //Set totalPrice for each item
        reqItem.totalPrice = parseFloat(
          (reqItem.pricePerItem * reqItem.quantity).toFixed(2),
          0
        );
        // saving name of items for records
        reqItem.name = savedItem.stockName;
      });
      //Calculate total order amount from DTO
      orders.totalAmount = dto.getCalculatedTotal();
      orders.orderQuantity = dto.getOrderQuantity();
      //Save the order
      return await this.handleRepositoryCall(
        this.orderRespository.saveOrder,
        orders
      );
    } catch (error) {
      this.logAndThrowError("Validation error saving order", error);
    }
  };

  getOrderStatus = async (order_id) => {
    return await this.handleRepositoryCall(
      this.orderRespository.getOrderByOrderId,
      order_id
    );
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
      // update the status field in object
      order.status = status;
      return await this.handleRepositoryCall(
        this.orderRespository.saveOrder,
        order,
        true
      );
    } catch (error) {
      this.logAndThrowError("Validation error saving order", error);
    }
  };

  getOrderByStatusOrAll = async (filter) => {
    filter.skip = this.getSkipNumber(filter.page, filter.limit);

    const [Orders, total] = await Promise.all([
      this.orderRespository.getOrderOrSearch(filter),
      this.orderRespository.countOrders(filter),
    ]);

    // Format the response
    const response = super.prepareResponse(Orders, "Orders");

    if (Array.isArray(Orders) && Orders.length > 0) {
      response.pagination = {
        currentPage: filter.page,
        totalPages: Math.ceil(total / filter.limit),
        totalCount:total,
      };
    }

    return response;
  };
}
export default OrderService;
