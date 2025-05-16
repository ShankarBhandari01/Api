import BaseRepo from "./BaseRepository.js";
import Orders from "../models/Orders.js";
import Products from "../models/Stocks.js";

class OrderRespository extends BaseRepo {
  constructor({ connection }) {
    super(connection);
    // registering models in connection
    this.order = Orders(connection).OrderModel;
    this.customer = Orders(connection).CustomerModel;
    this.item = Products(connection).Stock;
    this.category = Products(connection).Category;
  }

  checkCustomerSave = async (InCustomer) => {
    const existingCustomer = await this.customer
      .findOne({ email: InCustomer.email })
      .lean();
    if (existingCustomer) {
      return existingCustomer;
    }
    return await this.customer.create(InCustomer);
  }; // getCustomer method
  getOrderItems = async (itemIds) => {
    return await this.item.find({ _id: { $in: itemIds } }).lean();
  };
  getOrderByOrderId = async (order_id, populate = false) => {
    const order = await this.order.findOne({ orderId: order_id });
    if (!order) return null;
    return populate
      ? await order.populate("customer", "customerId name email phone address")
      : order;
  };

  getOrderOrSearch = async (filters) => {
    const {
      status,
      search,
      startDate,
      endDate,
      skip,
      limit,
      sort = "desc",
      sortBy = "createdDate",
    } = filters;

    const query = {};

    if (status && status !== "") {
      query.status = status;
    }

    if (startDate && endDate) {
      query.createdDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const searchMatch = search
      ? {
          $or: [
            { "customer.name": { $regex: search, $options: "i" } },
            { "customer.email": { $regex: search, $options: "i" } },
            { "customer.phone": { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const sortOrder = sort === "asc" ? 1 : -1;

    const pipeline = [
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },

      { $match: { ...query, ...searchMatch } },

      { $sort: { [sortBy]: sortOrder } },
      { $skip: skip },
      { $limit: parseInt(limit) },

      {
        $lookup: {
          from: "stocks",
          localField: "items.item",
          foreignField: "_id",
          as: "itemsData",
        },
      },
    ];

    return await this.order.aggregate(pipeline);
  };

  countOrders = async (filters) => {
    const { status, search, startDate, endDate } = filters;

    const query = {};

    if (status && status !== "") {
      query.status = status;
    }

    if (startDate && endDate) {
      query.createdDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const searchMatch = search
      ? {
          $or: [
            { "customer.name": { $regex: search, $options: "i" } },
            { "customer.email": { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Aggregate to count with $lookup
    const result = await this.order.aggregate([
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
      { $match: { ...query, ...searchMatch } },
      { $count: "total" },
    ]);

    return result[0]?.total || 0;
  };

  saveOrder = async (newOrder, isStatusUpdate = false) => {
    try {
      var savedOrder = {};
      // updating status
      if (isStatusUpdate) {
        savedOrder = await newOrder.save();
      } else {
        savedOrder = await this.order.create(newOrder);
      }

      //Populate customer and item details
      const order = await this.order
        .findById(savedOrder._id)
        .populate({
          path: "customer",
          select: " customerId name email phone address",
        })
        .populate({ path: "items.item" })
        .lean();

      return order;
    } catch (error) {
      this.logAndThrowError("Database Error saving order", error);
    }
  };
}
export default OrderRespository;
