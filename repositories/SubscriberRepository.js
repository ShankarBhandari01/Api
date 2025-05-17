import BaseRepository from "./BaseRepository.js";
import Subscriber from "../models/SubscriberModel.js";
import Campaign from "../models/CampaignModel.js";
import Image from "../models/Image.js";

class SubscriberRepository extends BaseRepository {
  constructor({ connection }) {
    super(connection);
    this.model = Subscriber(connection);
    this.CampaignModel = Campaign(connection);
    this.connection = connection;
    this.image = Image(connection);
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
    try {
      const now = new Date();
      await this.CampaignModel.updateMany(
        { endDate: { $lt: now }, status: { $ne: "expired" } },
        { $set: { status: "expired" } }
      );
    } catch (error) {
      this.log(`[Api] ${error.message}`, "error");
    }
  };
  handleImageUpload = async (image, session) => {
    const result = await this.validateImageDimensions(image);
    if (!result.valid) {
      throw Error(result.message);
    }
    let imageId = null;
    if (image) {
      imageId = await this.handleImageUploadToDatabase(image, session);
    }
    return imageId; // Return the imageId
  };
  addCampaingn = async (inCampaign, image) => {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      inCampaign.image = (await this.handleImageUpload(image, session)) || null;

      const campaign = await this.CampaignModel.create(inCampaign);
      await session.commitTransaction();
      return campaign;
    } catch (error) {
      await session.abortTransaction();
      this.logAndThrowError(error.message, error);
    } finally {
      await session.endSession();
    }
  };

  getAllCampaigns = async (status = "") => {
    try {
      let filters = {};
      if (status !== "") {
        filters = { status: status };
      }
      const campaigns = await this.CampaignModel.find(filters)
        .populate("image")
        .lean();

      for (const campaign of campaigns) {
        if (campaign.image) {
          campaign.imageBase64 = this.formatProfileImage(campaign.image);
          delete campaign.image;
        }
      }
      return campaigns;
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
    })
      .populate("image")
      .lean();

    for (const campaign of campaigns) {
      if (campaign.image) {
        campaign.imageBase64 = this.formatProfileImage(campaign.image);
        delete campaign.image;
      }
    }
    return campaigns;
  };
  // api
  updateCampaign = async (campaignId, updateData, image) => {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // check if another active campaign exists
      const isAnyActiveCampaign = await this.CampaignModel.exists({
        status: "Active",
      });

      if (isAnyActiveCampaign && updateData.status === "Active") {
        throw new Error(
          "Cannot update campaign while another campaign is active"
        );
      }

      // handle image update
      if (image) {
        updateData.image = await this.handleImageUpload(image, session);
      }
      // update campaign
      const updatedCampaign = await this.CampaignModel.findByIdAndUpdate(
        campaignId,
        updateData,
        {
          new: true,
          runValidators: true,
          session,
        }
      );

      if (!updatedCampaign) {
        throw new Error(`Campaign with ID ${campaignId} not found.`);
      }
      await session.commitTransaction();
      return updatedCampaign;
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Failed to update campaign: ${error.message}`);
    } finally {
      await session.endSession();
    }
  };

  getCampaignByid = async (id) =>
    await this.CampaignModel.findById(id).populate("image").lean();

  deleteOne = async (id) => await this.CampaignModel.deleteOne({ _id: id });
  deleteImageById = async (id) => await this.image.deleteOne({ _id: id });

  // job
  updateCampaignAfterJob = async (
    campaignId,
    error = {},
    status = "Completed"
  ) => {
    await this.CampaignModel.findByIdAndUpdate(
      campaignId,
      {
        status: status,
        issueMessage: error,
      },
      { new: true }
    );
  };
}

export default SubscriberRepository;
