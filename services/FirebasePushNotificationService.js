import firebase from 'firebase-admin';
import serviceAccount from "../firebase-service-account.json" with { type: "json" };
import BaseService from "./BaseService.js";
import { formatFinnishDateTime } from "../utils/dateFormatter.js";

class FirebasePushNotificationService extends BaseService {
  constructor({ connection, notificationRepository, userService, notificationQueueService }) {
    super(connection);
    this.connection = connection;
    this.notificationRepository = notificationRepository;
    this.userService = userService;
    this.notificationQueueService = notificationQueueService;
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
      const { time, date } = formatFinnishDateTime(data.reservation_date);
      const title = `New Reservation from ${data.customer_name}!`;

      const body =
        `${data.customer_name} has reserved a table for ${data.number_of_guests} guest(s) on ${date} at ${time}.` +
        (data.special_requests
          ? ` Special request: "${data.special_requests}".`
          : "");

      const notification = { title, body };

      const fcmsTokens = await this.getFcmToken();

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

      notification.data = data;
      notification.type = "reservation"
      await this.savenotification(notification, null);

    } catch (error) {
      this.log(`Error sending notification: ${error}`, "error");
    }
  };

  // Send push notification to admins on new order
  sendPushNotificationToAdminsOnNewOrder = async (orderData) => {
    try {
      const { customer, items, totalAmount, createdDate } = orderData;
      // since createdDate is object type, so need to parsed in iso date string. 
      const toISOstringDateTime= new Date(createdDate).toISOString()
      const { time, date } = formatFinnishDateTime(toISOstringDateTime);

      const itemSummary = items
        .map((i) => `${i.name.fi || i.name.en} x${i.quantity}`)
        .join(", ");

      const title = `New Order Received`;
      const body =
        `${customer?.name || "A customer"} placed an order of ${items.length} item(s) on ${date} at ${time}.\n` +
        `Items: ${itemSummary}\nTotal: €${totalAmount}`;

      const notification = { title, body };
      const fcmsTokens = await this.getFcmToken();


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
      notification.data = orderData;
      notification.type = "order"
      await this.savenotification(notification, customer);

    } catch (error) {
      this.log(`Error sending order notification: ${error}`, "error");
    }
  };

  // socket io notification channel function 
  sendSocketioNotification = async (notificationData, userIds = null) => {
    if (!notificationData) {
      this.log("notification Data is required to send socket.io notification", "error");
      return;
    }
    if (!userIds) {
      const users = await this.userService.getAllUsers();
      userIds = users.data.map(user => user._id?.toString());
    }

    if (typeof userIds === "string") {
      userIds = [userIds];
    }

    return await Promise.all(
      userIds.map(userId => this.notificationQueueService.send(userId, notificationData, notificationData.type))
    );
  };


  savenotification = async (notificationData, customer) => {
    try {
      const notification = {
        title: notificationData.title,
        message: notificationData.body,
        type: notificationData.type,
        customerId: customer ? customer._id : null,
      };

      // Send socket.io notification
      await this.sendSocketioNotification(notificationData);

      return await this.handleRepositoryCall(
        this.notificationRepository.saveNotification,
        notification
      );

    } catch (error) {
      this.log(`Error saving notification: ${error}`, "error");
    }
  };

  getNotifications = async (page, limit) => {
    const skip = this.getSkipNumber(page, limit);

    const [notification, total] = await Promise.all([
      this.notificationRepository.getNotifications(limit, skip),
      this.notificationRepository.getDocumentCounts()
    ]);
    // Format the response
    const response = super.prepareResponse(notification, "notification");

    if (Array.isArray(notification) && notification.length > 0) {
      response.pagination = {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
      };
    }

    return response;
  }


  updateNotification = async (id) =>
    await this.handleRepositoryCall(this.notificationRepository.updateSeenStatus, id);

  deleteNotification = async (id) =>
    await this.handleRepositoryCall(this.notificationRepository.deleteNotification, id);

  updateAllSeenStatus = async (ids) =>
    await this.handleRepositoryCall(this.notificationRepository.updateAllSeenStatus, ids);

}

export default FirebasePushNotificationService;
