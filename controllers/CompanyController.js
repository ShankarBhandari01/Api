import { mapToCompanyDTO } from "../helper/CompanyDTOHelper.js";
import BaseController from "./BaseController.js";

class CompanyController extends BaseController {
  constructor({ req, res, companyService, firebasePushNotificationService }) {
    super(req, res);
    this.companyService = companyService;
    this.firebasePushNotificationService = firebasePushNotificationService;
  }
  deleteRole = async () => {
    const { id } = this.req.params;
    await this.runServiceMethod(
      this.companyService,
      (service) => service.deleteRole(id),
      "Role deleted successfully"
    );
  };
  updateRole = async () => {
    const { id } = this.req.params;
    await this.runServiceMethod(
      this.companyService,
      (service) => service.updateRole(id, this.req.body),
      "Role updated successfully"
    );
  };
  addRole = async () =>
    await this.runServiceMethod(
      this.companyService,
      (service) => service.addRoleWithMenuRights(this.req.body, this.lang),
      "Role info added"
    );

  getRoles = async () =>
    await this.runServiceMethod(
      this.companyService,
      (service) => service.getRoles(this.lang),
      "Roles fetched successfully"
    );

  updateMenu = async () => {
    const { id } = this.req.params;
    await this.runServiceMethod(
      this.companyService,
      (service) => service.updateMenu(id, this.req.body),
      "Menu updated successfully"
    );
  };
  deleteMenu = () => {
    const { id } = this.req.params;
    this.runServiceMethod(
      this.companyService,
      (service) => service.deleteMenu(id),
      "Mennu deleted successfully"
    );
  };

  getMenus = async () =>
    await this.runServiceMethod(
      this.companyService,
      (service) => service.getMenus(this.lang),
      "Menus fetched successfully"
    );

  async addMenu() {
    await this.runServiceMethod(
      this.companyService,
      (service) => service.addMenus(this.req.body, this.lang),
      "Menu info added"
    );
  }
  async getCompanyInfo() {
    await this.runServiceMethod(
      this.companyService,
      (service) => service.getCompanyInfo(this.lang),
      "Company info fetched"
    );
  }
  async addCompanyInfo() {
    await this.runServiceMethod(
      this.companyService,
      (service) => {
        const dto = mapToCompanyDTO(this.req);
        return service.addCompanyInfo(dto, this.lang);
      },
      "Company info added"
    );
  }

  async addTable() {
    await this.runServiceMethod(
      this.companyService,
      (service) => service.addTable(this.req.body, this.lang),
      "Table added"
    );
  }

  // notification
  async getNotifications() {
    await this.runServiceMethod(
      this.firebasePushNotificationService,
      (service) => service.getNotifications(),
      "Notifications fetched"
    );
  }

  updateNotification = async () => {
    const { id } = this.req.params;
    await this.runServiceMethod(
      this.firebasePushNotificationService,
      (service) => service.updateNotification(id),
      "Notification updated successfully"
    );
  };
  deleteNotification = async () => {
    const { id } = this.req.params;
    await this.runServiceMethod(
      this.firebasePushNotificationService,
      (service) => service.deleteNotification(id),
      "Notification deleted successfully"
    );
  };
}

export default CompanyController;
