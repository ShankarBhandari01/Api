const BaseService = require("./BaseService");

class CompanyService extends BaseService {
    constructor(companyRepository) {
        super();
        this.companyRepository = companyRepository;
    }

    getCompanyInfo = async (lang) => {
        try {
            let company = await this.companyRepository.getCompanyInfo(lang);
            if (company) {
                // omitting data from company and saving new object in updateDate var
                const {created_at, updated_at, ...updateData} = company.toObject();
                company = updateData;
            }
            return super.prepareResponse(company);
        } catch (err) {
            throw {message: err.message};
        }

    }

    addCompanyInfo = async (companyInfo, lang) => {
        try {
            const company = await this.companyRepository.addCompanyInfo(companyInfo);
            return super.prepareResponse(company);
        } catch (err) {
            throw {message: err.message};
        }

    }

}

module.exports = {
    CompanyService
}