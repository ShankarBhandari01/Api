const BaseRepo = require("./BaseRepo");

class CompanyRepository extends BaseRepo {
    constructor(companyModel) {
        super();
        this.company = companyModel;
    }

    getCompanyInfo = async (lang) => {
        return await this.company.findOne();
    }
    addCompanyInfo = async (companyInfo) => {
        return this.company.create(companyInfo);
    }
}

module.exports = CompanyRepository;