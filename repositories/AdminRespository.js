import BaseRepository from "./BaseRepository.js";
import AdminModel from "../models/Admin.js";
import VideoLinks from "../models/VideoLinks.js";

class AdminRepository extends BaseRepository {
  constructor({ connection }) {
    super(connection);
    this.connection = connection;
    this.adminModel = AdminModel(connection);
    this.videoLinksModel = VideoLinks(connection);
  }

  getCorsWhitelist = async () =>
    await this.adminModel.getByKey("cors_whitelist");

  createCorsWhitelist = async (domains) => {
    return await this.adminModel.create({
      key: "cors_whitelist",
      value: domains,
    });
  };

  updateCorsWhitelist = async (id, domains) => {
    return await this.adminModel.findOneAndUpdate(
      { _id: id },
      { value: domains },
      { new: true, runValidators: true }
    );
  };

  uploadVideoLinks = async (linksObjects) => {
    return await this.videoLinksModel.create(linksObjects);
  };

  getVideoLinks = async () => {
    return await this.videoLinksModel.find();
  };

  updateVideoLinks = async (id, linksObjects) => {
    return await this.videoLinksModel.findOneAndUpdate(
      { _id: id },
      { $set: linksObjects },
      { new: true, runValidators: true }
    );
  };
  getVideoById = async (id) => {
    return await this.videoLinksModel.findById(id);
  };

  deleteVidoLinks = async (id) =>
    await this.videoLinksModel.findOneAndDelete({ _id: id });
}

export default AdminRepository;
