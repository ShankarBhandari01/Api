const { Schema } = require("mongoose");
let ReservationModel;
let TableModel;

module.exports = (connection) => {
  if (ReservationModel && TableModel) {
    return { ReservationModel, TableModel };
  }

  const AutoIncrement = require("mongoose-sequence")(connection);
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

  // Plugin uses this `connection` instance now
  ReservationSchema.plugin(AutoIncrement, {
    inc_field: "reservation_id",
    start_seq: 1,
  });

  ReservationSchema.post("save", function (doc) {
    if (doc.reservation_id && !doc.reservation_code) {
      doc.reservation_code = `RES-${doc.reservation_id
        .toString()
        .padStart(3, "0")}`;
      doc.save();
    }
  });

  ReservationSchema.index({ customer_email: 1 });
  ReservationSchema.index({ reservation_date: 1 });
  ReservationSchema.index({ table_id: 1 });

  const TableSchema = new Schema(
    {
      table_number: { type: Number, required: true },
      seats: { type: Number, required: true },
      available_times: [Date],
    },
    { timestamps: { createdAt: "createdDate", updatedAt: "updated_ts" } }
  );

  TableSchema.index({ table_number: 1 });

  ReservationModel = connection.model("Reservation", ReservationSchema);
  TableModel = connection.model("Table", TableSchema);

  return { ReservationModel, TableModel };
};
