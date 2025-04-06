const Logger = require("../utils/logger");
const RequestHandler = require("../utils/RequestHandler");
const CompanyRepository = require("../repositories/CompanyRepository");
const { Company } = require("../model/Company");
const { CompanyService } = require("../services/CompanyService");
const { mapToCompanyDTO } = require("../helper/CompanyDTOHelper"); // Import the helper function


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
  try {
   const lang = req.session.lang || "en"; // Default to English
    const response = await companyService.addTable(req.body,lang);
    return requestHandler.sendSuccess(res, "tables info")(response);
  } catch (error) {
    requestHandler.sendError(req, res, error);
  }
};
