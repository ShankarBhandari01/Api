import { Types } from "mongoose";

class OrderDTO {
  constructor({
    customer,
    items,
    totalAmount,
    orderType,
    pareparingTime,
    orderRemarks,
    reason,
    vatPercent = 14, // 14% VAT INCLUDED in prices
  }) {
    this.customer = customer;
    this.items = items || [];
    this.totalAmount = totalAmount;
    this.orderType = orderType;
    this.pareparingTime = pareparingTime;
    this.orderRemarks = orderRemarks;
    this.reason = reason;
    this.vatPercent = vatPercent;
  }

  isValidObjectId(id) {
    return Types.ObjectId.isValid(id);
  }

  validate() {
    if (this.customer.phone !== undefined && this.customer.phone !== null) {
      // check the number length
      let phone_number = Number(this.customer.phone);
      if (isNaN(phone_number) || phone_number >= 10) {
        throw new Error("invalid phone number");
      }
    }

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
      if (item.quantity <= 0 || item.quantity >= 20) {
        throw new Error(`Quantity out of range (1–20) at index ${index}`);
      }
      if (
        !item.pricePerItem ||
        typeof item.pricePerItem !== "number" ||
        item.pricePerItem < 0
      ) {
        throw new Error(`Missing or invalid price for item at index ${index}`);
      }
      // Ensure totalPrice is calculated
      item.totalPrice = parseFloat(
        (item.quantity * item.pricePerItem).toFixed(2)
      );
    });
    return true;
  }

  // calculate full order total
  getCalculatedTotal() {
    return parseFloat(
      this.items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)
    );
  }
  // Subtotal WITHOUT VAT
  getSubtotalExcludingVAT() {
    const total = this.getCalculatedTotal();
    const subtotal = total / (1 + this.vatPercent / 100);
    return parseFloat(subtotal.toFixed(2));
  }

  // VAT portion already inside the total
  getVATAmountIncluded() {
    const total = this.getCalculatedTotal();
    const vat = (total * this.vatPercent) / (100 + this.vatPercent);
    return parseFloat(vat.toFixed(2));
  }

  getOrderQuantity() {
    return parseFloat(this.items.reduce((sum, item) => sum + item.quantity, 0));
  }
}

export default OrderDTO;
