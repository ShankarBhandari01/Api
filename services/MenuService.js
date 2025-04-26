const BaseService = require("./BaseService");
const MenuRepository = require("../repositories/MenuRepository");

class MenuService extends BaseService {
  constructor(connection) {
    super(connection);
    this.menuRepository = new MenuRepository(connection);
  }

  addMenuType = async (menuTypes) => {
    try {
      const result = await this.menuRepository.addMenuType(menuTypes);
      return super.prepareResponse(result);
    } catch (error) {
      throw { message: error.message };
    }
  };

  getMenuTypes = async () =>
    await this.handleRepositoryCall(this.menuRepository.getMenuTypes);

  addMenu = async (menuData) =>
    await this.handleRepositoryCall(this.menuRepository.addMenu, menuData);

  getMenu = async (id) =>
    await this.handleRepositoryCall(this.menuRepository.getMenu, id);

  getAllMenus = async (lang, type) => {
    return await this.handleRepositoryCall(
      this.menuRepository.getGroupedMenuWithWeekdays,
      type
    );
  };

  updateMenu = async (id, menuData) => {
    try {
      const existingMenu = await this.menuRepository.getMenu(id);
      if (!existingMenu) {
        throw new Error("Menu not found");
      }
      if (menuData.name && menuData.name !== existingMenu.name) {
        const menuWithSameName = await this.menuRepository.getMenuByType(
          menuData
        );
        if (menuWithSameName) {
          throw new Error("Menu name already exists");
        }
      }
      // Update fields
      await this.handleRepositoryCall(
        this.menuRepository.updateMenu,
        id,
        menuData
      );
    } catch (error) {
      throw new Error("Error updating menu: " + error.message);
    }
  };
  deleteMenu = async (id) =>
    await this.handleRepositoryCall(this.menuRepository.deleteMenu, id);

  deleteMenuType = async (id) =>
    await this.handleRepositoryCall(this.menuRepository.deleteMenuType, id);
}

module.exports = { MenuService };
