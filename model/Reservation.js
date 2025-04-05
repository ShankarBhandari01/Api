const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
  customer_name: String,
  customer_email: String,
  phone_number: String,
  reservation_date: Date,
  number_of_guests: Number,
  special_requests: String,
  table_id: { type: mongoose.Schema.Types.ObjectId, ref: "Table" }, // Reference to a table
});

const TableSchema = new mongoose.Schema({
  table_number: Number,
  seats: Number,
  available_times: [Date], // Times when this table is available
});

const Reservation = mongoose.model("Reservation", ReservationSchema);
const Table = mongoose.model("Table", TableSchema);
module.exports = { Reservation, Table };

// Optionally: send confirmation email or SMS here
// sendConfirmationEmail(customer_email, newReservation);

    // Check if a table is available for the requested time
   // const availableTable = await Table.findOne({
   //   seats: { $gte: number_of_guests },  // Check if table has enough seats
    //  available_times: { $in: [new Date(reservation_date)] },  // Check if table is available at the given time
   // });