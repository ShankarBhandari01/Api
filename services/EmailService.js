import { createTransport } from "nodemailer";
import pkg from "handlebars";
import { readFileSync } from "fs";
import appconfig from "../config/appconfig.js";
import BaseService from "../services/BaseService.js";
import { registerHelpers } from "../helper/handlebarsHelpers.js";
const { compile } = pkg;
registerHelpers(pkg);

class EmailService extends BaseService {
  constructor() {
    super();
    this.templateCache = {};
    // Centralized template registry
    this.templatePaths = {
      bookingRejection: {
        fi: "./templates/reservationRejection.html",
      },
      bookingConfirmation: {
        fi: "./templates/fi.html",
        en: "./templates/en.html",
      },
      marketing: {
        fi: "./templates/marketingFi.html",
        en: "./templates/marketingEn.html",
      },
      orderConfirmation: {
        fi: "./templates/orderFi.html",
        en: "./templates/orderEn.html",
      },
      orderRejected: {
        fi: "./templates/orderRejectedFi.html",
      },
      newOrders: {
        en: "./templates/newOrdersEn.html",
      },
    };

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

  loadTemplate(templateKey, lang = "fi") {
    const cacheKey = `${templateKey}-${lang}`;
    if (this.templateCache[cacheKey]) {
      return this.templateCache[cacheKey];
    }

    const filePath =
      this.templatePaths[templateKey]?.[lang] ??
      this.templatePaths[templateKey]?.["fi"];
    if (!filePath) {
      throw new Error(
        `Template not found for key: ${templateKey} and lang: ${lang}`
      );
    }

    const template = readFileSync(filePath, "utf-8");
    const compiled = compile(template);
    this.templateCache[cacheKey] = compiled;

    return compiled;
  }

  // Generic email sender
  async sendEmailNotification({
    customer_email,
    subject,
    templateKey,
    lang = "fi",
    templateData,
  }) {
    const template = this.loadTemplate(templateKey, lang);
    const htmlContent = template(templateData);

    const mailOptions = {
      from: `"14 Peaks" <${appconfig.sendgrid.from_email}>`,
      to: Array.isArray(customer_email)
        ? customer_email.join(",")
        : customer_email,
      subject,
      html: htmlContent,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.log(`${subject} email sent successfully`, "info");
    } catch (error) {
      this.log(`Error sending email: ${error}`, "error");
    }
  }

  // Order email to customer
  async sendOrderPlaceConfirmation(orderData, lang = "fi") {
    let subject;

    if (orderData.status === "accepted") {
      subject =
        lang === "fi"
          ? `Tilausvahvistus – Ravintola 14 Peaks (Tilausnumero: ${orderData.orderId})`
          : `Order Confirmation – Restaurant 14 Peaks (Order No: ${orderData.orderId})`;
    } else if (
      orderData.status === "rejected" ||
      orderData.status === "cancelled"
    ) {
      subject =
        lang === "fi"
          ? `Tilaus peruutettu – Ravintola 14 Peaks (Tilausnumero: ${orderData.orderId})`
          : `Order Cancelled – Restaurant 14 Peaks (Order No: ${orderData.orderId})`;
    } else {
      // fallback
      subject =
        lang === "fi"
          ? `Tilaustiedot – Ravintola 14 Peaks (Tilausnumero: ${orderData.orderId})`
          : `Order Details – Restaurant 14 Peaks (Order No: ${orderData.orderId})`;
    }

    const templateData = {
      templateKey: "orderConfirmation",
      customer_name: orderData.customer.name,
      customer_email: orderData.customer.email,
      order_number: orderData.orderId,
      customer_phone: orderData.customer.phone,
      order_date: new Date(orderData.createdDate).toLocaleDateString("fi-FI"),
      order_items: orderData.items,
      total_price: orderData.totalAmount,
      order_type: orderData.orderType,
      preparing_time: orderData.pareparingTime,
      order_status: orderData.status,
      vat_percent: orderData.vatPercent || 14,
      order_remarks: orderData.orderRemarks,
      subtotal_price: orderData.subtotal, // this should be amount before VAT
      vat_amount: orderData.vatAmount || 0, // this should be the VAT amount
    };

    if (orderData.status === "rejected" || orderData.status === "cancelled") {
      templateData.cancellation_reason = orderData.reason;
      templateData.templateKey = "orderRejected";
    }

    await this.sendEmailNotification({
      customer_email: templateData.customer_email,
      subject,
      templateKey: templateData.templateKey,
      lang,
      templateData,
    });
  }

  // Order email to admin
  sendOrderNotificationEmailToAdmin = async (orderData, lang = "en") => {
    const subject = `New Order – Restaurant 14 Peaks (Order No: ${orderData.orderId})`;

    const templateData = {
      templateKey: "newOrders",
      customer_name: orderData.customer.name,
      customer_email: orderData.customer.email,
      customer_phone: orderData.customer.phone,
      order_number: orderData.orderId,
      order_date: new Date(orderData.createdDate).toLocaleDateString("fi-FI"),
      order_items: orderData.items,
      total_price: orderData.totalAmount,
      order_type: orderData.orderType,
      preparing_time: orderData.pareparingTime,
      order_status: orderData.status,
      vat_percent: orderData.vatPercent || 14,
      order_remarks: orderData.orderRemarks,
      subtotal_price: orderData.subtotal, // this should be amount before VAT
      vat_amount: orderData.vatAmount || 0, // this should be the VAT amount
    };

    await this.sendEmailNotification({
      customer_email: ["kesharioy@gmail.com", "admin@ravintola14peaks.fi"],
      subject,
      templateKey: templateData.templateKey,
      lang,
      templateData,
    });
  };

  // Send booking email (confirmation or rejection)
  async sendBookingEmail(reservationData) {
    const {
      lang = "fi",
      customer_email,
      customer_name,
      reservation_date,
      reservation_code,
      number_of_guests,
      special_requests,
      status = "confirmed", // "confirmed" or "rejected"
    } = reservationData;

    const dateObj = new Date(reservation_date);
    const formattedTime = `${String(dateObj.getHours()).padStart(
      2,
      "0"
    )}:${String(dateObj.getMinutes()).padStart(2, "0")}`;
    const formattedDate = dateObj.toLocaleDateString("fi-FI");

    const templateData = {
      customer_name,
      reservation_date: formattedDate,
      reservation_time: formattedTime,
      number_of_guests,
      special_requests,
      reservation_code,
    };

    // Define email subject per language and status
    const subjects = {
      fi: {
        confirmed: "Varausvahvistus: Pöytävaraus",
        rejected: "Valitettavasti emme voi vahvistaa varaustasi",
      },
      en: {
        confirmed: "Booking Confirmation: Table Reservation",
        rejected: "Unfortunately, we cannot confirm your reservation",
      },
    };

    const subject = subjects[lang]?.[status] || subjects["fi"][status];
    const templateKey =
      status === "confirmed" ? "bookingConfirmation" : "bookingRejection";

    await this.sendEmailNotification({
      customer_email,
      subject,
      templateKey,
      lang,
      templateData,
    });
  }

  // Push Notification (marketing)
  async sendPushNotification(templateData) {
    const subject =
      templateData.lang === "fi" ? "Uusi Ilmoitus" : "New Notification";

    await this.sendEmailNotification({
      customer_email: templateData.customer_email,
      subject,
      templateKey: "marketing",
      lang: templateData.lang,
      templateData,
    });
  }
}

export default EmailService;
