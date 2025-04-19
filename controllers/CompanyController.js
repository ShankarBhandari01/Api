const { CompanyService } = require("../services/CompanyService");
const { mapToCompanyDTO } = require("../helper/CompanyDTOHelper");
const BaseController = require("./BaseController");

class CompanyController extends BaseController {
  constructor(req, res) {
    super(req, res);
  }
  deleteRole = async () => {
    const { id } = this.req.params;
    await this.runServiceMethod(
      CompanyService,
      (service) => service.deleteRole(id),
      "Role deleted successfully"
    );
  };
  updateRole = async () => {
    const { id } = this.req.params;
    await this.runServiceMethod(
      CompanyService,
      (service) => service.updateRole(id, this.req.body),
      "Role updated successfully"
    );
  };
  addRole = async () =>
    await this.runServiceMethod(
      CompanyService,
      (service) => service.addRoleWithMenuRights(this.req.body, this.lang),
      "Role info added"
    );

  getRoles = async () =>
    await this.runServiceMethod(
      CompanyService,
      (service) => service.getRoles(this.lang),
      "Roles fetched successfully"
    );

  updateMenu = async () => {
    const { id } = this.req.params;
    await this.runServiceMethod(
      CompanyService,
      (service) => service.updateMenu(id, this.req.body),
      "Menu updated successfully"
    );
  };
  deleteMenu = () => {
    const { id } = this.req.params;
    this.runServiceMethod(
      CompanyService,
      (service) => service.deleteMenu(id),
      "Mennu deleted successfully"
    );
  };

  getMenus = async () =>
    await this.runServiceMethod(
      CompanyService,
      (service) => service.getMenus(this.lang),
      "Menus fetched successfully"
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
