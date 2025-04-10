const admin = require("firebase-admin");
const serviceAccount = require("../firebase-service-account.json");
const BaseService = require("./BaseService");

class FirebasePushNotificationService extends BaseService {
  constructor(connection) {
    super(connection);
    this.connection = connection;
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

      if (fcmsTokens && fcmsTokens.length > 0) {
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
      }
    } catch (error) {
      this.log(`Error sending notification: ${error}`, "error");
    }
  };
}

module.exports = FirebasePushNotificationService;
