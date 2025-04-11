const BaseService = require("./BaseService");
const {
  SubscriberRepository,
} = require("../repositories/SubscriberRepository");

class SubscriberService extends BaseService {
  constructor(connection) {
    super(connection);
    this.connection = connection;
    this.repository = new SubscriberRepository(connection);
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

  getSubscribers = async () => {
    try {
      const response = await this.repository.getAllSubscribers();
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

  addCampaingn = async (campaign) => {
    try {
      // const subscribers = await this.repository.getSubscribers();
      const response = this.repository.addCampaingn(campaign);
      return super.prepareResponse(response);
    } catch (error) {
      throw { message: error.message };
    }
  };
}

module.exports = { SubscriberService };
