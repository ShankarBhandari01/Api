import BaseRepo from "./BaseRepository.js";
import reservationModels from "../models/Reservation.js";
import CompanyModel from "../models/Company.js";
import ImageSchema from "../models/Image.js";
import Menu from "../models/UiMenuRight.js";
import Role from "../models/Role.js";
import Feedbacks from "../models/Feedbacks.js";
import VatRate from "../models/VatRate.js";

class CompanyRepository extends BaseRepo {
  constructor({ connection }) {
    super();
    this.connection = connection;
    this.company = CompanyModel(connection).CompanyModel;
    this.imageModel = ImageSchema(connection);
    this.menu = Menu(connection);
    this.role = Role(connection);
    this.feedback = Feedbacks(connection);
    this.VatRateModel = VatRate(connection);
  }
  // Check for overlapping VAT rates
  findOverlappingVatRates = async (country, category, validFrom, validTo) => {
    return await this.VatRateModel.find({
      country: country,
      category: category,
      $or: [
        {
          validFrom: { $lte: validTo },
          validTo: { $gte: validFrom },
        },
        {
          validFrom: { $lte: validFrom },
          validTo: { $gte: validFrom },
        },
        {
          validFrom: { $lte: validTo },
          validTo: { $gte: validTo },
        },
      ],
    });
  };
  
  // Add a new VAT rate
  addVatRate = async (vatRateData) =>
    await this.VatRateModel.create(vatRateData);

  addReview = async (review) => await this.feedback.create(review)

  getReviews = async () => await this.feedback.find().lean();

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

  // Add closed dates to the company
  addClosedDates = async (closedDates) => {
    try {
      if (!Array.isArray(closedDates)) {
        throw new Error("Invalid closedDates: expected an array");
      }

      const existingCompany = await this.getCompanyInfo();
      if (!existingCompany) {
        throw new Error("Company info not found");
      }

      const update = {
        $addToSet: {
          "openingHours.closedDates": { $each: closedDates },
        },
        $set: { updated_at: new Date() },
      };

      return await this.company
        .findByIdAndUpdate(existingCompany._id, update, {
          new: true,
        })
        .populate("logo")
        .lean();
    } catch (err) {
      this.logAndThrowError("Error updating closed dates", err);
    }
  };

  deleteClosedDates = async (closedDates) => {
    try {
      if (!Array.isArray(closedDates)) {
        throw new Error("Invalid closedDates: expected an array");
      }

      const existingCompany = await this.getCompanyInfo();
      if (!existingCompany) {
        throw new Error("Company info not found");
      }

      const datesOnly = closedDates.map((d) => new Date(d.date));

      const update = {
        $pull: {
          "openingHours.closedDates": {
            date: { $in: datesOnly },
          },
        },
        $set: { updated_at: new Date() },
      };

      return await this.company
        .findByIdAndUpdate(existingCompany._id, update, {
          new: true,
        })
        .populate("logo")
        .lean();
    } catch (err) {
      this.logAndThrowError("Error deleting closed dates", {
        originalError: err,
        closedDates,
      });
    }
  };

}

export default CompanyRepository;
