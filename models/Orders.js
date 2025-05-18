import mongoose, { Schema as _Schema } from "mongoose";
const { Schema } = mongoose;
import { randomBytes } from "crypto";
// Helper function to generate alphanumeric IDs
function generateAlphanumericId(prefix = "") {
  return prefix + randomBytes(4).toString("hex").toUpperCase();
}
// Reservation Model (Customer)
let CustomerModel;
// Order Model (Table)
let OrderModel;
export default (connection) => {
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
      },
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      phone: { type: String, required: true },
      address: { type: String },
    },
    { timestamps: { createdAt: "createdDate", updatedAt: "updated_ts" } }
  );
  // Indexes for customer schema for faster searches
  customerSchema.index({ createdAt: 1 });
  // Order Schema
  const orderSchema = new Schema(
    {
      orderId: {
        type: String,
        default: () => generateAlphanumericId("ORD-"),
        unique: true,
      },
      orderType: {
        type: String,
        enum: ["TakeAway", "EatIn"],
        required: true,
        default: "EatIn",
      },
      pareparingTime: {
        type: Number,
        required: false,
        default: 0,
      },
      orderRemarks: {
        type: String,
        required: false,
        default: "",
      },
      reason: {
        type: String,
        required: false,
        default: "",
      },
      customer: {
        type: _Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
      },
      items: [
        {
          item: { type: _Schema.Types.ObjectId, ref: "Stock" },
          quantity: { type: Number, required: true },
          pricePerItem: { type: Number, required: true },
          totalPrice: { type: Number, required: true },
          name: {
            en: { type: String, required: true, trim: true },
            fi: { type: String, required: true, trim: true },
          },
          special_requests: { type: String, required: false, trim: true },
          _id: false,
        },
      ],
      totalAmount: { type: Number, required: true },
      status: {
        type: String,
        enum: [
          "pending",
          "processing",
          "rejected",
          "accepted",
          "completed",
          "cancelled",
        ],
        default: "pending",
      },
      orderQuantity: { type: Number, required: true },
    },
    { timestamps: { createdAt: "createdDate", updatedAt: "updated_ts" } }
  );
  orderSchema.index({ createdAt: 1 });
  // Create models
  CustomerModel = connection.model("Customer", customerSchema);
  OrderModel = connection.model("Order", orderSchema);
  return { CustomerModel, OrderModel };
};
