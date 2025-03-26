const Logger = require("../utils/logger");
const RequestHandler = require("../utils/RequestHandler");
const CompanyRepository = require("../repo/CompanyRepository");
const { Company } = require("../model/Company");
const {CompanyService} = require("../services/CompanyService");

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

const companyRepo = new CompanyRepository(Company);
const companyService = new CompanyService(companyRepo);

exports.getCompanyInfo = async (req, res, next) => {
    try {
        if (req.query.lang) {
            req.session.lang = req.query.lang;
        }
        // language set
        const lang = req.session.lang || "en"; // Default to English

        const response = await companyService.getCompanyInfo(lang);

        return requestHandler.sendSuccess(res, "company info")(response);
    } catch (err) {
        requestHandler.sendError(req, res, err);
    }
}
exports.addCompanyInfo = async (req, res, next) => {
    try {
        if (req.query.lang) {
            req.session.lang = req.query.lang;
        }
        // language set
        const lang = req.session.lang || "en"; // Default to English

        const response = await companyService.addCompanyInfo(req.body, lang);
        return requestHandler.sendSuccess(res, "company info")(response);

    } catch (err) {
        requestHandler.sendError(req, res, err);
    }


}