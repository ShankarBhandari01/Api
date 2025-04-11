const BaseRepository = require("./BaseRepository");
const { DatabaseError } = require("../utils/errors");
const Subscriber = require("../models/SubscriberModel");
const Campaign = require("../models/CampaignModel");

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
      throw new DatabaseError(`Error adding subscribers: ${error.message}`);
    }
  };

  getSubscriberByEmail = async (email) => {
    try {
      return await this.model.findOne({ email: email });
    } catch (error) {
      throw new DatabaseError(`Error getting subscribers: ${error.message}`);
    }
  };
  unsubscribe = async (email) => {
    try {
      await this.model.deleteOne({ email: email });
    } catch (error) {
      throw new DatabaseError(`Error deleting subscribers: ${error.message}`);
    }
  };

  getAllSubscribers = async () => {
    try {
      return await this.model.find();
    } catch (error) {
      throw new DatabaseError(`Error getting subscribers: ${error.message}`);
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
      throw new DatabaseError(`Error adding campaign: ${error.message}`);
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
      throw new DatabaseError(`Error getting campaigns: ${error.message}`);
    }
  };
  getAllActiveCampaign = async () => {
    const now = new Date();
    const campaigns = await this.CampaignModel.find({
      status: "Active",
      startDate: { $lte: now },
      endDate: { $gte: now },
    });
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

module.exports = { SubscriberRepository };
