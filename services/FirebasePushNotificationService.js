import firebase from 'firebase-admin';
import serviceAccount from "../firebase-service-account.json" with { type: "json" };
import BaseService from "./BaseService.js";
import { sendSocketioNotification } from "../jobs/notification.job.js";

class FirebasePushNotificationService extends BaseService {
  constructor({ connection, notificationRepository }) {
    super(connection);
    this.connection = connection;
    this.notificationRepository = notificationRepository;
    this.initializeFirebase();
  }

  // Initialize Firebase app with credentials
  initializeFirebase() {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp({
          credential: firebase.credential.cert(serviceAccount),
        });
      }
    } catch (error) {
      this.log(`Firebase initialization failed: ${error}`, "error");
    }
  }

  // Send push notification to all tokens
  sendPushNotificationToAll = async (data) => {
    try {
      const date = new Date(data.reservation_date);
      const reservationTime = date.toLocaleTimeString("fi-FI", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const reservationDate = date.toLocaleDateString("fi-FI", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const title = `New Reservation from ${data.customer_name}!`;

      const body =
        `${data.customer_name} has reserved a table for ${data.number_of_guests} guest(s) on ${reservationDate} at ${reservationTime}.` +
        (data.special_requests
          ? ` Special request: "${data.special_requests}".`
          : "");

      const notification = { title, body };

      const fcmsTokens = await this.getFcmToken();
      await this.savenotification(notification, null, "reservation");

      if (fcmsTokens && fcmsTokens.length > 0) {
        const message = {
          notification,
          tokens: fcmsTokens.map((fcm) => fcm.token),
        };
        const response = await firebase.messaging().sendEachForMulticast(message);
        this.log(`Multicast notification sent successfully: ${JSON.stringify(response)}`, "info");
      } else {
        this.log("No FCM tokens found", "error");
      }
    } catch (error) {
      this.log(`Error sending notification: ${error}`, "error");
    }
  };

  // Send push notification to admins on new order
  sendPushNotificationToAdminsOnNewOrder = async (orderData) => {
    try {
      const { customer, items, totalAmount, createdDate } = orderData;

      const orderTime = new Date(createdDate).toLocaleTimeString("fi-FI", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const orderDate = new Date(createdDate).toLocaleDateString("fi-FI", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const itemSummary = items
        .map((i) => `${i.name.fi || i.name.en} x${i.quantity}`)
        .join(", ");

      const title = `New Order Received`;
      const body =
        `${customer?.name || "A customer"} placed an order of ${items.length} item(s) on ${orderDate} at ${orderTime}.\n` +
        `Items: ${itemSummary}\nTotal: €${totalAmount}`;

      const notification = { title, body };
      const fcmsTokens = await this.getFcmToken();

      await this.savenotification(notification, customer, "order");

      if (Array.isArray(fcmsTokens) && fcmsTokens.length > 0) {
        const message = {
          notification,
          tokens: fcmsTokens.map((fcm) => fcm.token),
        };

        const response = await firebase.messaging().sendEachForMulticast(message);
        this.log(`Order notification sent to admins: ${JSON.stringify(response)}`, "info");
      } else {
        this.log("No admin FCM tokens found", "warn");
      }
    } catch (error) {
      this.log(`Error sending order notification: ${error}`, "error");
    }
  };
// socket io notification channel function 
  sendSocketioNotification=async(userId, message)=> {
    await sendSocketioNotification(userId,message)
  }

  savenotification = async (notificationData, customer, type) => {
    try {
      const notification = {
        title: notificationData.title,
        message: notificationData.body,
        type,
        customerId: customer ? customer._id : null,
      };

      return await this.handleRepositoryCall(
        this.notificationRepository.saveNotification,
        notification
      );
    } catch (error) {
      this.log(`Error saving notification: ${error}`, "error");
    }
  };

  getNotifications = async () =>
    await this.handleRepositoryCall(this.notificationRepository.getNotifications);

  updateNotification = async (id) =>
    await this.handleRepositoryCall(this.notificationRepository.updateSeenStatus, id);

  deleteNotification = async (id) =>
    await this.handleRepositoryCall(this.notificationRepository.deleteNotification, id);

 
  
}

export default FirebasePushNotificationService;
