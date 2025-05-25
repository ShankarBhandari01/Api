import BaseRepository from "./BaseRepository.js";
import AdminModel from "../models/Admin.js";

class AdminRepository extends BaseRepository {
  constructor({ connection }) {
    super(connection);
    this.connection = connection;
    this.adminModel = AdminModel(connection);
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
}

export default AdminRepository;
