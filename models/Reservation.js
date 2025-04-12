const { Schema } = require("mongoose");
let ReservationModel;
let TableModel;

module.exports = (connection) => {
  if (ReservationModel && TableModel) {
    return { ReservationModel, TableModel };
  }

  // Reservation Schema Definition
  const ReservationSchema = new Schema(
    {
      reservation_code: {
        type: String,
        unique: true,
      },
      customer_name: { type: String, required: true },
      customer_email: { type: String, required: true },
      phone_number: { type: String, required: true },
      reservation_date: { type: Date, required: true },
      number_of_guests: { type: Number, required: true },
      special_requests: { type: String },
      table_id: { type: Schema.Types.ObjectId, ref: "Table", required: true },
    },
    { timestamps: { createdAt: "createdDate", updatedAt: "updated_ts" } }
  );

  // Pre-save hook for generating reservation_code
  ReservationSchema.pre("save", async function (next) {
    const session = await this.constructor.db.startSession();
    session.startTransaction();

    try {
      // Ensure reservation date is in the future
      if (this.reservation_date < new Date()) {
        return next(new Error("Reservation date cannot be in the past"));
      }

      // Ensure table exists before saving reservation
      const table = await TableModel.findById(this.table_id).session(session);
      if (!table) {
        return next(new Error("Invalid table ID"));
      }
      const lastReservation = await this.constructor
        .findOne()
        .sort({ reservation_code: -1 })
        .limit(1)
        .session(session);

      const lastReservationNumber = lastReservation
        ? parseInt(lastReservation.reservation_code.split("-")[1], 10)
        : 0;

      this.reservation_code = `RES-${(lastReservationNumber + 1).toString().padStart(3, "0")}`;

      // Commit transaction to ensure atomic operation
      await session.commitTransaction();
      session.endSession();

      next(); // Proceed with saving the reservation
    } catch (error) {
      await session.abortTransaction(); // Abort if there's an error
      session.endSession();
      next(error); 
    }
  });

  // Define Indexes
  ReservationSchema.index({ customer_email: 1 });
  ReservationSchema.index({ reservation_date: 1 });
  ReservationSchema.index({ table_id: 1 });

  // Table Schema Definition
  const TableSchema = new Schema(
    {
      table_number: { type: Number, required: true },
      seats: { type: Number, required: true },
      available_times: [Date], // Array of available time slots
    },
    { timestamps: { createdAt: "createdDate", updatedAt: "updated_ts" } }
  );

  // Index on table_number for optimized search
  TableSchema.index({ table_number: 1 });

  // Create the models
  ReservationModel = connection.model("Reservation", ReservationSchema);
  TableModel = connection.model("Table", TableSchema);

  return { ReservationModel, TableModel };
};
