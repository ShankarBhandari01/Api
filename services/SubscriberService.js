import BaseService from "./BaseService.js";
import SubscriberRepository from "../repositories/SubscriberRepository.js";

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
    return await this.handleRepositoryCall(this.repository.getAllSubscribers);
  };
  getSubscriberByEmail = async (email) => {
    return await this.repository.getSubscriberByEmail(email);
  };
  unsubscribe = async (email) => {
    return await this.handleRepositoryCall(this.repository.unsubscribe, email);
  };

  addCampaingn = async (campaign) => {
    return await this.handleRepositoryCall(
      this.repository.addCampaingn,
      campaign 
    );   
  };
}

export default SubscriberService;
