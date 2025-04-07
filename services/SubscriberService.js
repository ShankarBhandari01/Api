const BaseService = require("./BaseService");

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
    
  };
}

module.exports = { SubscriberService };
