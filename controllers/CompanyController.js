const Logger = require("../utils/logger");
const RequestHandler = require("../utils/RequestHandler");
const CompanyRepository = require("../repo/CompanyRepository");
const { Company } = require("../model/Company");
const { CompanyService } = require("../services/CompanyService");
const { mapToCompanyDTO } = require("../helper/CompanyDTOHelper"); // Import the helper function
const {Table} = require("../model/Reservation");

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

const companyRepo = new CompanyRepository(Company);
const companyService = new CompanyService(companyRepo);

exports.getCompanyInfo = async (req, res, next) => {
  try {
    const lang = req.session.lang || "en"; // Default to English
    const response = await companyService.getCompanyInfo(lang);

    return requestHandler.sendSuccess(res, "company info")(response);
  } catch (err) {
    requestHandler.sendError(req, res, err);
  }
};
exports.addCompanyInfo = async (req, res, next) => {
  try {
    const lang = req.session.lang || "en"; // Default to English
    const companyDTO = mapToCompanyDTO(req);
    const response = await companyService.addCompanyInfo(companyDTO, lang);
    return requestHandler.sendSuccess(res, "company info")(response);
  } catch (err) {
    requestHandler.sendError(req, res, err);
  }
};
exports.addTable = async (req, res) => {
  const { table_number, seats, available_times } = req.body;

  try {
    const newTable = new Table({
      table_number,
      seats,
      available_times,
    });

    await newTable.save();

    res.status(201).json({
      status: "success",
      message: "Table added successfully.",
      table_id: newTable._id,
    });
  } catch (error) {
    console.error("Error adding table:", error);
    res.status(500).json({
      status: "error",
      message: "Error adding the table. Please try again.",
    });
  }
};
