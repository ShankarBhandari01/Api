// services/emailService.js
const nodemailer = require('nodemailer');

// Create a transporter for sending emails (using Gmail in this example)
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Use 'gmail' or other SMTP service
  auth: {
    user: process.env.FROM_EMAIL,  // Your Gmail email address (can use an environment variable)
    pass: process.env.GMAIL_PASS,  // Your Gmail password or App Password (use an environment variable)
  },
});

/**
 * Sends a booking confirmation email.
 * @param {String} customerEmail - The email address of the customer.
 * @param {Object} reservationData - The reservation details to include in the email.
 */
async function sendConfirmationEmail(customerEmail, reservationData) {
  const { customer_name, reservation_date, number_of_guests, special_requests } = reservationData;

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: customerEmail,           
    subject: 'Booking Confirmation: Table Reservation',
    text: `
      Dear ${customer_name},

      Your table has been successfully booked!

      Reservation Details:
      - Date: ${new Date(reservation_date).toLocaleString()}
      - Number of Guests: ${number_of_guests}
      - Special Requests: ${special_requests || 'None'}

      Thank you for choosing our restaurant! We look forward to serving you.

      Best regards,
      The Restaurant Team
    `,
    html: `
      <p>Dear ${customer_name},</p>
      <p>Your table has been successfully booked!</p>
      <h3>Reservation Details:</h3>
      <ul>
        <li>Date: ${new Date(reservation_date).toLocaleString()}</li>
        <li>Number of Guests: ${number_of_guests}</li>
        <li>Special Requests: ${special_requests || 'None'}</li>
      </ul>
      <p>Thank you for choosing our restaurant! We look forward to serving you.</p>
      <p>Best regards,<br>The Restaurant Team</p>
    `,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = {
  sendConfirmationEmail,
};
