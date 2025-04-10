const BaseService = require("./BaseService");
const CompanyRepository = require('../repositories/CompanyRepository');

class CompanyService extends BaseService {
    constructor(connection) {
        super(connection);
        this.companyRepository = new CompanyRepository(connection);
    }

    getCompanyInfo = async (lang) => {
        return await this.handleRepositoryCall(this.companyRepository.getCompanyInfo);
    };

    addCompanyInfo = async (companyInfo, lang) => {
        return await this.handleRepositoryCall(this.companyRepository.addCompanyInfo, companyInfo);
    };

    addTable = async (table, lang) => {
        return await this.handleRepositoryCall(this.companyRepository.addTable, table);
    }
}

module.exports = {
    CompanyService,
};
