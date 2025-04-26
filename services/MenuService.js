const BaseService = require("./BaseService");
const MenuRepository = require("../repositories/MenuRepository");
const StockRepository = require("../repositories/stockRepo");

class MenuService extends BaseService {
  constructor(connection) {
    super(connection);
    this.menuRepository = new MenuRepository(connection);
    this.stockRepository = new StockRepository(connection);
  }
  getMenuTypes = async () => 
      await this.handleRepositoryCall(this.stockRepository.getMenuTypes);

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
      const updatedMenu = await this.Menu.findByIdAndUpdate(id, menuData, {
        new: true,
      });
      return updatedMenu;
    } catch (error) {
      throw new Error("Error updating menu: " + error.message);
    }
  };
  deleteMenu = async (id) => {
    try {
      const deletedMenu = await this.Menu.findByIdAndDelete(id);
      if (!deletedMenu) {
        throw new Error("Menu not found");
      }
      return deletedMenu;
    } catch (error) {
      throw new Error("Error deleting menu: " + error.message);
    }
  };
}
module.exports = { MenuService };
