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

  addCampaingn = async (campaign, image) => {
    return await this.handleRepositoryCall(
      this.repository.addCampaingn,
      campaign,
      image
    );
  };

  getAllCampaigns = async () => {
    return await this.handleRepositoryCall(this.repository.getAllCampaigns);
  };

  getActiveCampaign = async () =>
    await this.handleRepositoryCall(
      this.repository.getAllActiveCampaign,
      "Active"
    );

  updateCampaign = async (id, campaign, image) => {
    return await this.handleRepositoryCall(
      this.repository.updateCampaign,
      id,
      campaign,
      image
    );
  };
  deleteCampaign = async (id) => {
    try {
      if (!id) {
        throw new Error("Campaign ID is required for deletion");
      }
      const campaign = await this.repository.getCampaignByid(id);
      if (!campaign) {
        throw new Error("Campaign not found or already deleted");
      }
      if (campaign.status == "Active") {
        throw new Error("Cannot delete active campaign");
      }
      // Delete the associated image if it exists
      if (campaign.image && campaign.image._id) {
        await this.repository.deleteImageById;
        campaign.image._id;
      }
      // delete campaign
      return await this.handleRepositoryCall(this.repository.deleteOne, id);
    } catch (error) {
      throw { message: error.message };
    }
  };
}

export default SubscriberService;
