const BaseRepo = require("./BaseRepository");
const reservationModels = require("../models/Reservation");
const CompanyModel = require("../models/Company");
const ImageSchema = require("../models/Image");

class CompanyRepository extends BaseRepo {
  constructor(connection) {
    super(connection);
    this.company = CompanyModel(connection).CompanyModel;
    this.imageModel = ImageSchema(connection);
  }

  // Utility function to handle image upload logic
  async handleLogoUpload(imageData, session) {
    const newImage = new this.imageModel();
    if (imageData && imageData.length > 0) {
      const image = imageData[0];
      newImage.url = image.url;
      newImage.filename = image.originalname;
      newImage.contentType = image.mimetype;
      newImage.imageData = image.buffer;
      return await this.uploadImage(newImage, session);
    }
    return null;
  }

  // Get company info with population of related fields
  getCompanyInfo = async () => {
    try {
      return await this.company
        .findOne()
        .populate("openingHours")
        .populate("logo")
        .sort({ created_at: -1 })
        .lean();
    } catch (err) {
      this.logAndThrowError("Error retrieving company info", err);
    }
  };

  // Add or update company info with logo handling
  addCompanyInfo = async (companyInfo) => {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // Handle logo upload
      let logoId = null;
      if (companyInfo.logo) {
        logoId = await this.handleLogoUpload(companyInfo.logo, session);
      }

      if (companyInfo.name === "") {
        companyInfo.name = "The 14 peak, himalayan fusion";
      }

      companyInfo.logo = logoId;

      const company = await this.company
        .findOneAndUpdate(
          { name: companyInfo.name },
          {
            $set: {
              ...companyInfo,
              updated_at: new Date(),
            },
          },
          {
            upsert: true,
            new: true,
            session,
          }
        )
        .populate("logo")
        .populate("openingHours")
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

module.exports = CompanyRepository;
