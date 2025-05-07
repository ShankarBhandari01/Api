import BaseService from "./BaseService.js";

class SubscriberService extends BaseService {
  constructor({ connection, subscriberRepository }) {
    super(connection);
    this.connection = connection;
    this.repository = subscriberRepository;
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

  getAllSubscribe = async () =>
    await this.handleRepositoryCall(this.repository.getAllSubscribers);

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

  updateCampaign = async (id, campaign) => {
    return await this.handleRepositoryCall(
      this.repository.updateCampaign,
      id,
      campaign
    );
  };
}

export default SubscriberService;
