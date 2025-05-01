import BaseRepository from "./BaseRepository.js";
import Subscriber from "../models/SubscriberModel.js";
import Campaign from "../models/CampaignModel.js";

class SubscriberRepository extends BaseRepository {
  constructor(connection) {
    super(connection);
    this.model = Subscriber(connection);
    this.CampaignModel = Campaign(connection);
    this.connection = connection;
  }

  subscribe = async (subscribers) => {
    try {
      return await this.model.create(subscribers);
    } catch (error) {
      this.logAndThrowError(error.message, error);
    }
  };

  getSubscriberByEmail = async (email) => {
    try {
      return await this.model.findOne({ email: email });
    } catch (error) {
      this.logAndThrowError(error.message, error);
    }
  };
  unsubscribe = async (email) => {
    try {
      await this.model.deleteOne({ email: email });
    } catch (error) {
      this.logAndThrowError(error.message, error);
    }
  };

  getAllSubscribers = async () => {
    try {
      return await this.model.find();
    } catch (error) {
      this.logAndThrowError(error.message, error);
    }
  };

  updateAutomaticCampaignForJob = async () => {
    const now = new Date();
    await this.Campaign.updateMany(
      { endDate: { $lt: now }, status: { $ne: "expired" } },
      { $set: { status: "expired", updated_at: now } }
    );
  };

  addCampaingn = async (Campaign) => {
    try {
      return await this.CampaignModel.create(Campaign);
    } catch (error) {
      this.logAndThrowError(error.message, error);
    }
  };

  getAllCampaigns = async (status = "") => {
    try {
      let filters = {};
      if (status !== "") {
        filters = { status: status };
      }
      return await this.CampaignModel.find(filters);
    } catch (error) {
      this.logAndThrowError(error.message, error);
    }
  };
  getAllActiveCampaign = async () => {
    const now = new Date();
    const campaigns = await this.CampaignModel.find({
      status: "Active",
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).lean();
    return campaigns;
  };

  updateCampaignAfterJob = async (
    campaignId,
    error = {},
    status = "Completed"
  ) => {
    await this.CampaignModel.findByIdAndUpdate(
      campaignId,
      {
        status: status,
        updated_at: new Date(),
        issueMessage: error,
      },
      { new: true }
    );
  };
}

export default SubscriberRepository;
