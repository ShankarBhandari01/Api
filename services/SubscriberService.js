const BaseService = require("./BaseService");
const { EmailService } = require("./EmailService");

class SubscriberService extends BaseService {
  constructor(repository) {
    super();
    this.repository = repository;
  }

  subscribe = async (subscribers) => {
    try {
      //check if already subscribed
      const databaseSubscribers = await this.getSubscriberByEmail(
        subscribers.email
      );
      if (databaseSubscribers) {
        throw new Error("Already subscribed");
      }

      const response = await this.repository.subscribe(subscribers);
      const { _id, subscribedAt, ...updateData } = response.toObject();

      return super.prepareResponse(updateData);
    } catch (error) {
      throw { message: error.message };
    }
  };

  getSubscriberByEmail = async (email) => {
    try {
      return await this.repository.getSubscriberByEmail(email);
    } catch (error) {
      throw { message: error.message };
    }
  };
  unsubscribe = async (email) => {
    try {
      return await this.repository.unsubscribe(email);
    } catch (error) {
      throw { message: error.message };
    }
  };
  sendMarketingEmail = async (message) => {
    try {
      const subscribers = await this.repository.getSubscribers();
      if (subscribers) {
        const response = new EmailService().sendPushNotification();
      }
    } catch (error) {
      throw { message: error.message };
    }
  };
}

module.exports = { SubscriberService };
