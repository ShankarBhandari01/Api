const { CompanyService } = require("../services/CompanyService");
const { mapToCompanyDTO } = require("../helper/CompanyDTOHelper");
const BaseController = require("./BaseController");

class CompanyController extends BaseController {
  constructor(req, res) {
    super(req, res);
  }

  updateRole = async () => {
    const { id } = this.req.params;
    await this.runServiceMethod(
      CompanyService,
      (service) => service.updateRole(id,this.req.body),
      "Roles fetched successfully"
    );
  };

  getRoles = async () =>
    await this.runServiceMethod(
      CompanyService,
      (service) => service.getRoles(this.lang),
      "Roles fetched successfully"
    );

  getMenus = async () =>
    await this.runServiceMethod(
      CompanyService,
      (service) => service.getMenus(this.lang),
      "Menus fetched successfully"
    );

  addRole = async () =>
    await this.runServiceMethod(
      CompanyService,
      (service) => service.addRoleWithMenuRights(this.req.body, this.lang),
      "Role info added"
    );

  async addMenu() {
    await this.runServiceMethod(
      CompanyService,
      (service) => service.addMenus(this.req.body, this.lang),
      "Menu info added"
    );
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
