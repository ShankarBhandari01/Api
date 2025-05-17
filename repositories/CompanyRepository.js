import BaseRepo from "./BaseRepository.js";
import reservationModels from "../models/Reservation.js";
import CompanyModel from "../models/Company.js";
import ImageSchema from "../models/Image.js";
import Menu from "../models/UiMenuRight.js";
import Role from "../models/Role.js";

class CompanyRepository extends BaseRepo {
  constructor({ connection }) {
    super();
    this.connection = connection;
    this.company = CompanyModel(connection).CompanyModel;
    this.imageModel = ImageSchema(connection);
    this.menu = Menu(connection);
    this.role = Role(connection);
  }
  deleteRole = async (id) => await this.role.deleteOne({ _id: id });
  updateRoles = async (updateRoles) => updateRoles.save();
  getRoles = async () =>
    await this.role
      .find()
      .populate({
        path: "menuRights.menu",
      })
      .lean();
  findRoleById = async (id) =>
    await this.role.findById(id).populate({
      path: "menuRights.menu",
    });
  findRoleByName = async (newName) =>
    await this.role.findOne({ name: newName });
  addRole = async (roleData) => await this.role.create(roleData);

  getMenus = async () => await this.menu.find().lean();
  deleteMenu = async (id) => await this.menu.deleteOne({ _id: id });
  addMenu = async (newMenu) => await this.menu.create(newMenu);
  findMenuById = async (id) => await this.menu.findById(id);
  getMenuByPath = async (inPath) => await this.menu.findOne({ path: inPath });
  updateMenu = async (updateMenu) => await updateMenu.save();

  // Get company info with population of related fields
  getCompanyInfo = async () =>
    await this.company
      .findOne()
      .populate("logo")
      .sort({ created_at: -1 })
      .lean();

  // Add or update company info with logo handling
  addCompanyInfo = async (companyInfo) => {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Handle default name
      if (!companyInfo.name || companyInfo.name.trim() === "") {
        companyInfo.name = "The 14 Peak, Himalayan Fusion";
      }

      // Handle logo upload if provided
      let logoId = null;
      if (companyInfo.logo != "" && companyInfo.logo) {
        logoId = await this.handleImageUploadToDatabase(
          companyInfo.logo,
          session
        );
      }

      const existingCompany = await this.getCompanyInfo();

      const updateData = {
        ...companyInfo,
        updated_at: new Date(),
      };

      if (logoId) updateData.logo = logoId;

      const filter = existingCompany?._id ? { _id: existingCompany._id } : {}; // for upsert

      const company = await this.company
        .findOneAndUpdate(
          filter,
          { $set: updateData },
          {
            upsert: true,
            new: true,
            session,
          }
        )
        .populate("logo")
        .lean();

      await session.commitTransaction();
      return company;
    } catch (err) {
      await session.abortTransaction();
      this.logAndThrowError("Error updating company info", err);
    } finally {
      await session.endSession();
    }
  };

  // Add a table to the reservation system
  addTable = async (table) => {
    try {
      const TableModel = reservationModels(this.connection).TableModel;
      return await TableModel(table).save();
    } catch (err) {
      this.logAndThrowError("Error adding table", err);
    }
  };
}

export default CompanyRepository;
