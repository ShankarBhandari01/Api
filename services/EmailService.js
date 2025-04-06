const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const config = require("../config/appconfig");
const BaseService = require("../services/BaseService");

class EmailService extends BaseService {
  constructor() {
    super();
    this.templates = {
      en: "./templates/en.html",
      fi: "./templates/fi.html",
    };
    // Transporter configuration
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      secure: false,
      auth: {
        user: config.sendgrid.from_email,
        pass: config.sendgrid.gmail_pass,
      },
    });
  }

  // Load template based on the provided language
  loadTemplate(lang) {
    const filePath = this.templates[lang] || this.templates["en"];
    const template = fs.readFileSync(filePath, "utf-8");
    return handlebars.compile(template);
  }

  // Generic method to send email notifications
  async sendEmailNotification({ customer_email, subject, lang = "fi", templateData }) {
    const template = this.loadTemplate(lang);

    // Prepare the email content by injecting data into the template
    const htmlContent = template(templateData);

    const mailOptions = {
      from: config.sendgrid.from_email,
      to: customer_email,
      subject: subject,
      html: htmlContent,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`${subject} email sent successfully`);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  // Send a booking confirmation email
  async sendBookingConfirmation(reservationData) {
    const date = new Date(reservationData.reservation_date);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    let {
      lang = "fi",
      customer_email,
      customer_name,
      reservation_date,
      reservation_time,
      number_of_guests,
      special_requests,
    } = reservationData;

    reservation_time = `${hours}:${minutes}`;
    reservation_date = date.toLocaleDateString("fi-FI");

    const templateData = {
      customer_name,
      reservation_date,
      reservation_time,
      number_of_guests,
      special_requests,
    };

    // Determine the subject based on language
    const subject =
      lang === "fi" ? "Varausvahvistus: Pöytävaraus" : "Booking Confirmation: Table Reservation";

    await this.sendEmailNotification({
      customer_email,
      subject,
      lang,
      templateData,
    });
  }

  // Send a push notification (email format for simplicity)
  async sendPushNotification(pushData) {
    const {
      lang = "fi",
      customer_email,
      title,
      message,
    } = pushData;

    const templateData = {
      title,
      message,
    };

    // Determine the subject based on language
    const subject = lang === "fi" ? "Uusi Ilmoitus" : "New Notification";

    // Send the push notification email using the generic method
    await this.sendEmailNotification({
      customer_email,
      subject,
      lang,
      templateData,
    });
  }
}

module.exports = { EmailService };
