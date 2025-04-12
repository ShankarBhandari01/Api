const { Schema } = require("mongoose");
let ReservationModel;
let TableModel;
module.exports = (connection) => {
  if (ReservationModel && TableModel) {
    // Return existing models if already created
    return { ReservationModel, TableModel };
  }
  // Include mongoose-sequence to handle auto-increment logic
  const AutoIncrement = require("mongoose-sequence")(connection);
  // Reservation Schema Definition
  const ReservationSchema = new Schema(
    {
      reservation_id: {
        type: Number,
        unique: true,
      },
      reservation_code: {
        type: String,
        unique: true,
      },
      customer_name: { type: String, required: true },
      customer_email: { type: String, required: true },
      phone_number: { type: String, required: true },
      reservation_date: { type: Date, required: true },
      number_of_guests: { type: Number, required: true },
      special_requests: { type: String, required: false },
      table_id: { type: Schema.Types.ObjectId, ref: "Table" },
    },
    { timestamps: { createdAt: "createdDate", updatedAt: "updated_ts" } }
  );
  // Adding AutoIncrement to reservation_id
  ReservationSchema.plugin(AutoIncrement, {
    inc_field: "reservation_id", // field that will be auto-incremented
    start_seq: 1, // starting point for the increment
  });
  // Generate reservation code after save
  ReservationSchema.post("save", function (doc) {
    if (doc.reservation_id && !doc.reservation_code) {
      doc.reservation_code = `RES-${doc.reservation_id
        .toString()
        .padStart(3, "0")}`;
      doc.save(); // Save the reservation with the code
    }
  });
  // Indexes for optimized search
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
  // Create the models only if they are not already created
  ReservationModel = connection.model("Reservation", ReservationSchema);
  TableModel = connection.model("Table", TableSchema);
  // Return the models to be used elsewhere in the application
  return { ReservationModel, TableModel };
};
