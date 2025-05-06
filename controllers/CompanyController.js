import CompanyService from "../services/CompanyService.js";
import FirebasePushNotificationService from "../services/FirebasePushNotificationService.js";
import { mapToCompanyDTO } from "../helper/CompanyDTOHelper.js";
import BaseController from "./BaseController.js";
import CompanyRepository from "../repositories/CompanyRepository.js";
import NotificationRepository from "../repositories/NotificationRepository.js";

class CompanyController extends BaseController {
  constructor(req, res) {
    super(req, res);
  }
  deleteRole = async () => {
    const { id } = this.req.params;
    await this.runServiceMethod(
      CompanyService,
      { CompanyRepository: CompanyRepository },
      (service) => service.deleteRole(id),
      "Role deleted successfully"
    );
  };
  updateRole = async () => {
    const { id } = this.req.params;
    await this.runServiceMethod(
      CompanyService,
      { CompanyRepository: CompanyRepository },
      (service) => service.updateRole(id, this.req.body),
      "Role updated successfully"
    );
  };
  addRole = async () =>
    await this.runServiceMethod(
      CompanyService,
      { CompanyRepository: CompanyRepository },
      (service) => service.addRoleWithMenuRights(this.req.body, this.lang),
      "Role info added"
    );

  getRoles = async () =>
    await this.runServiceMethod(
      CompanyService,
      { CompanyRepository: CompanyRepository },
      (service) => service.getRoles(this.lang),
      "Roles fetched successfully"
    );

  updateMenu = async () => {
    const { id } = this.req.params;
    await this.runServiceMethod(
      CompanyService,
      { CompanyRepository: CompanyRepository },
      (service) => service.updateMenu(id, this.req.body),
      "Menu updated successfully"
    );
  };
  deleteMenu = () => {
    const { id } = this.req.params;
    this.runServiceMethod(
      CompanyService,
      { CompanyRepository: CompanyRepository },
      (service) => service.deleteMenu(id),
      "Mennu deleted successfully"
    );
  };

  getMenus = async () =>
    await this.runServiceMethod(
      CompanyService,
      { CompanyRepository: CompanyRepository },
      (service) => service.getMenus(this.lang),
      "Menus fetched successfully"
    );

  async addMenu() {
    await this.runServiceMethod(
      CompanyService,
      { CompanyRepository: CompanyRepository },
      (service) => service.addMenus(this.req.body, this.lang),
      "Menu info added"
    );
  }
  async getCompanyInfo() {
    await this.runServiceMethod(
      CompanyService,
      { CompanyRepository: CompanyRepository },
      (service) => service.getCompanyInfo(this.lang),
      "Company info fetched"
    );
  }
  async addCompanyInfo() {
    await this.runServiceMethod(
      CompanyService,
      { CompanyRepository: CompanyRepository },
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
      { CompanyRepository: CompanyRepository },
      (service) => service.addTable(this.req.body, this.lang),
      "Table added"
    );
  }

  // notification
  async getNotifications() {
    await this.runServiceMethod(
      FirebasePushNotificationService,
      { NotificationRepository: NotificationRepository },
      (service) => service.getNotifications(),
      "Notifications fetched"
    );
  }

  updateNotification = async () => {
    const { id } = this.req.params;
    await this.runServiceMethod(
      FirebasePushNotificationService,
      { NotificationRepository: NotificationRepository },
      (service) => service.updateNotification(id),
      "Notification updated successfully"
    );
  };
  deleteNotification = async () => {
    const { id } = this.req.params;
    await this.runServiceMethod(
      FirebasePushNotificationService,
      { NotificationRepository: NotificationRepository },
      (service) => service.deleteNotification(id),
      "Notification deleted successfully"
    );
  };
}

export default CompanyController;
