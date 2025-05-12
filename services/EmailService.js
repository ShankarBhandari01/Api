import { createTransport } from "nodemailer";
import pkg from "handlebars";
import { readFileSync } from "fs";
import appconfig from "../config/appconfig.js";
import BaseService from "../services/BaseService.js";
const { compile } = pkg;

class EmailService extends BaseService {
  constructor() {
    super();
    this.templates = {
      en: "./templates/en.html",
      fi: "./templates/fi.html",
      marketingEn: "templates/marketingEn.html",
      marketingFi: "templates/marketingFi.html",
    };
    // Transporter configuration
    this.transporter = createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: appconfig.sendgrid.from_email,
        pass: appconfig.sendgrid.email_pass,
      },
    });
  }

  // Load template based on the provided language
  loadTemplate(lang, ismarketing = false) {
    let filePath;
    if (ismarketing) {
      if (lang == "en") {
        filePath = this.templates["marketingEn"];
      } else {
        filePath = this.templates["marketingFi"];
      }
    } else {
      filePath = this.templates[lang] || this.templates["en"];
    }
    const template = readFileSync(filePath, "utf-8");
    return compile(template);
  }

  // Generic method to send email notifications
  async sendEmailNotification({
    customer_email,
    subject,
    lang = "fi",
    templateData,
    ismarketing = false,
  }) {
    const template = this.loadTemplate(lang, ismarketing);
    // Prepare the email content by injecting data into the template
    const htmlContent = template(templateData);
    const mailOptions = {
      from:`"14 Peaks" <${appconfig.sendgrid.from_email}>`,
      to: customer_email,
      subject: subject,
      html: htmlContent,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.log(`${subject} email sent successfully`, "info");
    } catch (error) {
      this.log(`Error sending email:${error}`, "error");
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
      reservation_code,
    } = reservationData;

    reservation_time = `${hours}:${minutes}`;
    reservation_date = date.toLocaleDateString("fi-FI");

    const templateData = {
      customer_name,
      reservation_date,
      reservation_time,
      number_of_guests,
      special_requests,
      reservation_code,
    };

    // Determine the subject based on language
    const subject =
      lang === "fi"
        ? "Varausvahvistus: Pöytävaraus"
        : "Booking Confirmation: Table Reservation";

    await this.sendEmailNotification({
      customer_email,
      subject,
      lang,
      templateData,
    });
  }
  //Send a push notification
  async sendPushNotification(templateData) {
    //Determine the subject based on language
    const subject =
      templateData.lang === "fi" ? "Uusi Ilmoitus" : "New Notification";
    //Send the push notification email using the generic method
    await this.sendEmailNotification({
      customer_email: templateData.customer_email,
      subject,
      lang: templateData.lang,
      templateData,
      ismarketing: true,
    });
  }
}

export default EmailService;
