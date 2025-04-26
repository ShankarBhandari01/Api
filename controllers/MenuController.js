const BaseController = require("./BaseController");
const { MenuService } = require("../services/MenuService");

class MenuController extends BaseController {
  constructor(req, res) {
    super(req, res);
  }

  getMenuTypes = async () => {
    await this.runServiceMethod(
      MenuService,
      (service) => service.getMenuTypes(),
      "Menu types fetched successfully"
    );
  }
  addMenu = async () => {
    await this.runServiceMethod(
      MenuService,
      (service) => service.addMenu(this.req.body),
      "Menu added successfully"
    );
  };




  getMenu = async () => {
    await this.runServiceMethod(
      MenuService,
      (service) => service.getMenu(this.req.params.id),
      "Menu fetched successfully"
    );
  };
  getAllMenus = async () => {
    const type = this.req.query.type || "";
    await this.runServiceMethod(
      MenuService,
      (service) => service.getAllMenus(this.lang, type),
      "Menus fetched successfully"
    );
  };
  updateMenu = async () => {
    await this.runServiceMethod(
      MenuService,
      (service) => service.updateMenu(this.req.params.id, this.req.body),
      "Menu updated successfully"
    );
  };
  deleteMenu = async () => {
    await this.runServiceMethod(
      MenuService,
      (service) => service.deleteMenu(this.req.params.id),
      "Menu deleted successfully"
    );
  };
}
module.exports = MenuController;
