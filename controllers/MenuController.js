import BaseController from "./BaseController.js";

class MenuController extends BaseController {
  constructor({ req, res, menuService }) {
    super(req, res);
    this.menuService = menuService;
  }

  addMenuTypes = async () => {
    await this.runServiceMethod(
      this.menuService,
      (service) => service.addMenuType(this.req.body),
      "Menu types added successfully"
    );
  };

  getMenuTypes = async () => {
    await this.runServiceMethod(
      this.menuService,
      (service) => service.getMenuTypes(),
      "Menu types fetched successfully"
    );
  };
  addMenu = async () => {
    await this.runServiceMethod(
      this.menuService,
      (service) => service.addMenu(this.req.body),
      "Menu added successfully"
    );
  };

  getMenu = async () => {
    await this.runServiceMethod(
      this.menuService,
      (service) => service.getMenu(this.req.params.id),
      "Menu fetched successfully"
    );
  };
  getAllMenus = async () => {
    const type = this.req.query.type || "";
    await this.runServiceMethod(
      this.menuService,
      (service) => service.getAllMenus(this.lang, type),
      "Menus fetched successfully"
    );
  };
  updateMenu = async () => {
    await this.runServiceMethod(
      this.menuService,
      (service) => service.updateMenu(this.req.params.id, this.req.body),
      "Menu updated successfully"
    );
  };
  deleteMenu = async () => {
    await this.runServiceMethod(
      this.menuService,
      (service) => service.deleteMenu(this.req.params.id),
      "Menu deleted successfully"
    );
  };

  deleteMenuType = async () => {
    await this.runServiceMethod(
      this.menuService,
      (service) => service.deleteMenuType(this.req.params.id),
      "Menu type deleted successfully"
    );
  };
}
export default MenuController;
