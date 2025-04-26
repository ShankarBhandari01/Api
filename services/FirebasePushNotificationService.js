const admin = require("firebase-admin");
const serviceAccount = require("../firebase-service-account.json");
const BaseService = require("./BaseService");
const NotificationRepository = require("../repositories/NotificationRepository");

class FirebasePushNotificationService extends BaseService {
  constructor(connection) {
    super(connection);
    this.connection = connection;
    this.notificationRepository = new NotificationRepository(connection);
    this.initializeFirebase();
  }

  // Initialize Firebase app with credentials
  initializeFirebase() {
    try {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
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

      const notification = {
        title,
        body,
      };

      const fcmsTokens = await this.getFcmToken();
      // Save notification to the database
      await this.savenotification(notification, null, "reservation");
      // Send notification to all tokens
      if (fcmsTokens !== "" && fcmsTokens.length > 0) {
        const message = {
          notification: {
            title: notification.title,
            body: notification.body,
          },
          tokens: fcmsTokens.map((fcm) => fcm.token), // Array of tokens
        };
        const response = await admin.messaging().sendEachForMulticast(message);
        this.log(
          `Multicast notification sent successfully: ${JSON.stringify(
            response
          )}`,
          "info"
        );
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
        `${customer?.name || "A customer"} placed an order of ${
          items.length
        } item(s) on ${orderDate} at ${orderTime}.\n` +
        `Items: ${itemSummary}\nTotal: €${totalAmount}`;

      const notification = {
        title,
        body,
      };
      // get all admin tokens
      const fcmsTokens = await this.getFcmToken();
      // Save notification to the database
      await this.savenotification(notification, customer, "order");
      // Send notification to admins
      if (Array.isArray(fcmsTokens) && fcmsTokens.length > 0) {
        const message = {
          notification,
          tokens: fcmsTokens.map((fcm) => fcm.token),
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        this.log(
          `Order notification sent to admins: ${JSON.stringify(response)}`,
          "info"
        );
      } else {
        this.log("No admin FCM tokens found", "warn");
      }
    } catch (error) {
      this.log(`Error sending order notification: ${error}`, "error");
    }
  };
  // Save notification to the database
  savenotification = async (notificationData, customer, type) => {
    try {
      let notification = {};
      notification.title = notificationData.title;
      notification.message = notificationData.body;
      notification.type = type;
      notification.customerId = customer ? customer._id : null;

      return await this.handleRepositoryCall(
        this.notificationRepository.saveNotification,
        notification
      );
    } catch (error) {
      this.log(`Error saving notification: ${error}`, "error");
    }
  };
  getNotifications = async () =>
    await this.handleRepositoryCall(
      this.notificationRepository.getNotifications
    );

  updateNotification = async (id) =>
    await this.handleRepositoryCall(
      this.notificationRepository.updateSeenStatus,
      id
    );

  deleteNotification = async (id) =>
    await this.handleRepositoryCall(
      this.notificationRepository.deleteNotification,
      id
    );
}

module.exports = FirebasePushNotificationService;
