const mongoose = require("mongoose");
const { Schema } = mongoose;
const crypto = require("crypto");
// Helper function to generate alphanumeric IDs
function generateAlphanumericId(prefix = "") {
  return prefix + crypto.randomBytes(8).toString("hex").toUpperCase();
}
// Reservation Model (Customer)
let CustomerModel;
// Order Model (Table)
let OrderModel;
module.exports = (connection) => {
  if (CustomerModel && OrderModel) {
    return { CustomerModel, OrderModel };
  }
  // Customer Schema
  const customerSchema = new Schema(
    {
      customerId: {
        type: String,
        default: () => generateAlphanumericId("CUST-"),
        unique: true,
        index: true,
      },
      contact: {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String },
      },
      createdAt: { type: Date, default: Date.now },
    },
    { timestamps: { createdAt: "createdDate", updatedAt: "updated_ts" } }
  );
  // Indexes for customer schema for faster searches
  customerSchema.index({ contact: 1 });
  customerSchema.index({ createdAt: 1 });
  // Order Schema
  const orderSchema = new Schema(
    {
      orderId: {
        type: String,
        default: () => generateAlphanumericId("ORD-"),
        unique: true,
        index: true,
      },
      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
      },
      items: [
        {
          item: { type: mongoose.Schema.Types.ObjectId, ref: "Stock" },
          quantity: { type: Number, required: true },
        },
      ],
      totalAmount: { type: Number, required: true },
      status: {
        type: String,
        enum: ["pending", "completed", "cancelled"],
        default: "pending",
      },
      orderQuantity: { type: Number, required: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: { createdAt: "createdDate", updatedAt: "updated_ts" } }
  );
  // Indexes for order schema for fast queries
  orderSchema.index({ orderId: 1 });
  orderSchema.index({ customer: 1 });
  orderSchema.index({ createdAt: 1 });
  // Create models
  CustomerModel = connection.model("Customer", customerSchema);
  OrderModel = connection.model("Order", orderSchema);
  return { CustomerModel, OrderModel };
};
