import BaseRepository from "./BaseRepository.js";
import Notificaition from "../models/Notification.js";
class NotificationRepository extends BaseRepository {
  constructor({ connection }) {
    super(connection);
    this.connection = connection;
    this.notification = Notificaition(connection);
  }

  saveNotification = async (newNotification) =>
    await this.notification.create(newNotification);

  getNotifications = async (limit, skip) =>
    this.notification
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

  updateSeenStatus = async (id) =>
    await this.notification.findByIdAndUpdate(
      id,
      { isRead: true },
      {
        new: true,
        runValidators: true,
      }
    );

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
  getDocumentCounts = async () => await this.notification.countDocuments();
}
export default NotificationRepository;
