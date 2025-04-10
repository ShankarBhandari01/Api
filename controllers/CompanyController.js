const { CompanyService } = require("../services/CompanyService");
const { mapToCompanyDTO } = require("../helper/CompanyDTOHelper");
const BaseController = require("./BaseController");

class CompanyController extends BaseController {
  constructor(req, res) {
    super(req, res);
  }

  async getCompanyInfo() {
    await this.runServiceMethod(
      CompanyService,
      (service) => service.getCompanyInfo(this.lang),
      "Company info fetched"
    );
  }
  async addCompanyInfo() {
    await this.runServiceMethod(
      CompanyService,
      (service) => {
        const dto = mapToCompanyDTO(this.req);
        return service.addCompanyInfo(dto, this.lang);
      },
      "Company info added"
    );
  }

  async addTable() {
    await this.runServiceMethod(
      CompanyService,
      (service) => service.addTable(this.req.body, this.lang),
      "Table added"
    );
  }
}

module.exports = CompanyController;
