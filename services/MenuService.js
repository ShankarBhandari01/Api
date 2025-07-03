import BaseService from "./BaseService.js";

class MenuService extends BaseService {
  constructor({ connection, menuRepository, redisSocketService }) {
    super(connection);
    this.menuRepository = menuRepository;
    this.redisSocketService = redisSocketService;
  }

  addMenuType = async (menuTypes) => {
    try {
      const result = await this.menuRepository.addMenuType(menuTypes);
      // Invalidate related cache
      await this.redisSocketService.delCacheKey("menuTypes:*");
      return super.prepareResponse(result);
    } catch (error) {
      throw { message: error.message, stack: error.stack };
    }
  };

  getMenuTypes = async () => {
    try {
      const cacheKey = "menuTypes:all";
      const cached = await this.redisSocketService.getCacheValue(cacheKey);
     // if (cached) return cached;

      const result = await this.menuRepository.getMenuTypes();
      const response = super.prepareResponse(result);
      await this.redisSocketService.setCacheValue(cacheKey, response, 60);
      return response;
    } catch (error) {
      throw { message: error.message, stack: error.stack };
    }
  };

  addMenu = async (menuData) => {
    try {
      const result = await this.menuRepository.addMenu(menuData);
      // Invalidate menu-related cache
      await this.redisSocketService.delCacheKey("menu:*");
      return super.prepareResponse(result);
    } catch (error) {
      throw { message: error.message, stack: error.stack };
    }
  };

  getMenu = async (id) => {
    try {
      const cacheKey = `menu:${id}`;
      const cached = await this.redisSocketService.getCacheValue(cacheKey);
      if (cached) return cached;

      const result = await this.menuRepository.getMenu(id);
      const response = super.prepareResponse(result);
      await this.redisSocketService.setCacheValue(cacheKey, response, 60);
      return response;
    } catch (error) {
      throw { message: error.message, stack: error.stack };
    }
  };

  getAllMenus = async (lang, type) => {
    try {
      const cacheKey = `menu:grouped:type:${type || "all"}`;
      const cached = await this.redisSocketService.getCacheValue(cacheKey);
      if (cached) return cached;

      const result = await this.menuRepository.getGroupedMenuWithWeekdays(type);
      const response = super.prepareResponse(result);
      await this.redisSocketService.setCacheValue(cacheKey, response, 60);
      return response;
    } catch {
      throw { message: error.message, stack: error.stack };
    }
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

      const updatedmanu = await this.menuRepository.updateMenu(id, menuData);

      // Invalidate specific and general cache
      await this.redisSocketService.delCacheKey(`menu:${id}`);
      await this.redisSocketService.delCacheKey("menu:*");

      return super.prepareResponse(updatedmanu);
    } catch (error) {
      throw { message: error.message, stack: error.stack };
    }
  };

  deleteMenu = async (id) => {
    try {
      const result = await this.menuRepository.deleteMenu(id);
      await this.redisSocketService.delCacheKey(`menu:${id}`);
      await this.redisSocketService.delCacheKey("menu:*");
      return super.prepareResponse(result);
    } catch (error) {
      throw { message: error.message, stack: error.stack };
    }
  };

  deleteMenuType = async (id) => {
    try {
      const result = await this.menuRepository.deleteMenuType(id);
      await this.redisSocketService.delCacheKey("menuTypes:*");
      return super.prepareResponse(result);
    } catch (error) {
      throw { message: error.message, stack: error.stack };
    }
  };
}

export default MenuService;
