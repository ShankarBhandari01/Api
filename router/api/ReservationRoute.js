const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { languageMiddleware } = require("../../middleware/languageMiddleware");
const fileupload = require("../../middleware/fileUploadMiddleware");
const { Reservation, Table } = require("../../model/Reservation");

router.post("/reservations/book", async (req, res) => {
  const {
    customer_name,
    customer_email,
    phone_number,
    reservation_date,
    number_of_guests,
    special_requests,
  } = req.body;

  try {
    // Check if a table is available for the requested time
    const availableTable = await Table.findOne({
      seats: { $gte: number_of_guests }, // Check if table has enough seats
      available_times: { $in: [new Date(reservation_date)] }, // Check if table is available at the given time
    });

    if (!availableTable) {
      return res.status(400).json({
        status: "error",
        message: "No tables available for the requested time.",
        error_code: "TABLE_UNAVAILABLE",
      });
    }

    // Create a new reservation
    const newReservation = new Reservation({
      customer_name,
      customer_email,
      phone_number,
      reservation_date: new Date(reservation_date),
      number_of_guests,
      special_requests,
      table_id: availableTable._id, // Assign table to the reservation
    });

    await newReservation.save();

    // Update the table's availability
    availableTable.available_times = availableTable.available_times.filter(
      (time) => time !== new Date(reservation_date)
    );
    await availableTable.save();

    // Send a success response with the reservation ID
    res.status(201).json({
      status: "success",
      message: "Your table has been successfully booked.",
      reservation_id: newReservation._id,
    });

    // Optionally: send confirmation email or SMS here
    // sendConfirmationEmail(customer_email, newReservation);
  } catch (error) {
    console.error("Error booking reservation:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error. Please try again later.",
    });
  }
});

module.exports = router;
