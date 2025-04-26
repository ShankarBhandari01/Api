const BaseRepository = require("./BaseRepository");
const Notificaition = require("../models/Notification");
class NotificationRepository extends BaseRepository {
  constructor(connection) {
    super(connection);
    this.connection = connection;
    this.notification = Notificaition(connection);
  }

  saveNotification = async (newNotification) =>
    await this.notification.create(newNotification);
  getNotifications = async () =>
    this.notification.find().sort({ createdAt: -1 }).lean();
  updateSeenStatus = async (id) =>
    await this.notification.findByIdAndUpdate(id, { isRead: true });

  clearNotifications = async () => {
    await this.notification.deleteMany({});
  };

  deleteNotification = async (notificationId) => {
    if (!notificationId) {
      await this.clearNotifications();
      return;
    }
    // If notificationId is provided, delete that specific notification
    await this.notification.findByIdAndDelete(notificationId);
  };
}
module.exports = NotificationRepository;
