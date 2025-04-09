const BaseService = require("./BaseService");
const imageModel = require("../models/Image");
const {response} = require("express");

class CompanyService extends BaseService {
    constructor(companyRepository) {
        super();
        this.companyRepository = companyRepository;
    }

    getCompanyInfo = async (lang) => {
        try {
            let company = await this.companyRepository.getCompanyInfo();
            if (company) {
                const {created_at, updated_at, ...updateData} = company;
                company = updateData;
            }
            return super.prepareResponse(company);
        } catch (err) {
            throw {message: err.message};
        }
    };

    addCompanyInfo = async (companyInfo, lang) => {
        try {
            // handle logo upload
            let isLogo = true
            const image = companyInfo.logo;
            const newImage = new imageModel();
            if (image && image.length > 0) {
                const imageData = image[0];
                newImage.url = imageData.url;
                newImage.filename = imageData.originalname;
                newImage.contentType = imageData.mimetype;
                newImage.imageData = imageData.buffer;
            } else {
                isLogo = false;
            }
            if (companyInfo.name === "") {
                companyInfo.name = 'The 14 peak, himalayan fusion';
            }
            const company = await this.companyRepository.addCompanyInfo(
                companyInfo,
                newImage,
                isLogo
            );
            return super.prepareResponse(company);
        } catch
            (err) {
            throw {message: err.message};
        }
    }
    ;

    addTable = async (table, lang) => {
        try {
            const response = this.companyRepository.addTable(table);
            return super.prepareResponse(response);
        } catch (err) {
            throw {message: err.message};
        }
    }
}

module
    .exports = {
    CompanyService,
};
