import { Types } from "mongoose";

class OrderDTO {
  constructor({ customer, items, totalAmount, orderType }) {
    this.customer = customer;
    this.items = items || [];
    this.totalAmount = totalAmount;
    this.orderType = orderType;
  }

  isValidObjectId(id) {
    return Types.ObjectId.isValid(id);
  }

  validate() {
    if (!Array.isArray(this.items) || this.items.length === 0) {
      throw new Error("Order must contain at least one item");
    }
    const itemIdsSet = new Set();
    this.items.forEach((item, index) => {
      if (!item.item || !this.isValidObjectId(item.item)) {
        throw new Error(`Invalid item ID at index ${index}`);
      }
      if (itemIdsSet.has(item.item)) {
        throw new Error(`Duplicate item found at index ${index}`);
      }
      itemIdsSet.add(item.item);

      if (!item.quantity || typeof item.quantity !== "number") {
        throw new Error(
          `Missing or invalid quantity for item at index ${index}`
        );
      }
      if (item.quantity <= 0 || item.quantity > 10) {
        throw new Error(`Quantity out of range (1–10) at index ${index}`);
      }
      if (
        !item.pricePerItem ||
        typeof item.pricePerItem !== "number" ||
        item.pricePerItem < 0
      ) {
        throw new Error(`Missing or invalid price for item at index ${index}`);
      }
    });
    return true;
  }

  // calculate full order total
  getCalculatedTotal() {
    return parseFloat(
      this.items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)
    );
  }

  getOrderQuantity() {
    return parseFloat(this.items.reduce((sum, item) => sum + item.quantity, 0));
  }
}

export default OrderDTO;
