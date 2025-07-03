import BaseRepo from "./BaseRepository.js";
import StockModels from "../models/Stocks.js";
import MenuType from "../models/MenuType.js";
import Menu from "../models/Menu.js";
import pkg from "lodash";
const { escapeRegExp } = pkg;
import mongoose from "mongoose";

class MenuRepository extends BaseRepo {
  constructor({ connection }) {
    super(connection);
    this.connection = connection;
    this.stockModel = StockModels(connection).Stock;
    this.Category = StockModels(connection).Category;
    this.menuTypes = MenuType(connection);
    this.menu = Menu(connection);
  }

  // Menu Type Operations
  getMenuTypeByCode = async (code) => {
    try {
      if (!code) {
        throw new Error("Menu type code is required");
      }
      return await this.menuTypes.findOne({ code });
    } catch (error) {
      this.logAndThrowError(`Error fetching menu type by code: ${code}`, error);
    }
  };

  addMenuType = async (menuTypes) => {
    try {
      if (!Array.isArray(menuTypes) || menuTypes.length === 0) {
        throw new Error("Menu types array is required and cannot be empty");
      }

      // Validate required fields
      const invalidItems = menuTypes.filter((mt) => !mt.code || !mt.name);
      if (invalidItems.length > 0) {
        throw new Error("All menu types must have code and name");
      }

      // Get existing codes in a single query
      const codes = menuTypes.map((mt) => mt.code);
      const existing = await this.menuTypes.find(
        { code: { $in: codes } },
        { code: 1 }
      );
      const existingCodes = new Set(existing.map((mt) => mt.code));

      // Filter out duplicates
      const newMenuTypes = menuTypes.filter(
        (mt) => !existingCodes.has(mt.code)
      );

      if (newMenuTypes.length === 0) {
        return {
          success: true,
          message: "All provided menu types already exist. Nothing inserted.",
          inserted: 0,
          duplicates: menuTypes.length,
        };
      }

      const result = await this.menuTypes.insertMany(newMenuTypes);
      return {
        success: true,
        message: `Successfully inserted ${result.length} menu types`,
        inserted: result.length,
        duplicates: menuTypes.length - result.length,
        data: result,
      };
    } catch (error) {
      this.logAndThrowError("Error adding menu types", error);
    }
  };

  getMenuTypes = async (options = {}) => {
    try {
      const { isActive = true, sort = { name: 1 } } = options;
      const query = isActive !== null ? { isActive } : {};
      const menuTypes = await this.menuTypes.find(query).sort(sort).lean();

      return menuTypes;
    } catch (error) {
      this.logAndThrowError("Error fetching menu types", error);
    }
  };

  getMenuTypeById = async (id) => {
    try {
      if (!this.isValidObjectId(id)) {
        throw new Error("Invalid menu type ID");
      }
      return await this.menuTypes.findById(id);
    } catch (error) {
      this.logAndThrowError(`Error fetching menu type by ID: ${id}`, error);
    }
  };

  deleteMenuType = async (id) => {
    try {
      if (!this.isValidObjectId(id)) {
        throw new Error("Invalid menu type ID");
      }

      // Check if menu type is in use
      const menusUsingType = await this.menu.countDocuments({ menuType: id });
      if (menusUsingType > 0) {
        throw new Error(
          `Cannot delete menu type. It is used by ${menusUsingType} menu(s)`
        );
      }

      const deletedMenuType = await this.menuTypes.findByIdAndDelete(id);
      if (!deletedMenuType) {
        throw new Error("Menu type not found");
      }
      return deletedMenuType;
    } catch (error) {
      this.logAndThrowError("Error deleting menu type", error);
    }
  };

  // Menu Operations
  addMenu = async (menuData) => {
    try {
      await this.validateMenuData(menuData);

      // Check for duplicates
      await this.checkMenuDuplicates(menuData);

      // Validate all stock items exist and are active
      const allItems = this.getAllMenuItems(menuData);
      const allItemsValid = await this.itemsExist(allItems);
      if (!allItemsValid) {
        throw new Error("One or more stock items are invalid or not active");
      }

      return await this.menu.create(menuData);
    } catch (error) {
      this.logAndThrowError("Error adding menu", error);
    }
  };

  updateMenu = async (id, menuData) => {
    try {
      if (!this.isValidObjectId(id)) {
        throw new Error("Invalid menu ID");
      }

      await this.validateMenuData(menuData, id);

      // Check for duplicates (excluding current menu)
      await this.checkMenuDuplicates(menuData, id);

      // Validate all stock items
      const allItems = this.getAllMenuItems(menuData);
      const allItemsValid = await this.itemsExist(allItems);
      if (!allItemsValid) {
        throw new Error("One or more stock items are invalid or not active");
      }

      const updatedMenu = await this.menu.findOneAndUpdate(
        { _id: id },
        menuData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedMenu) {
        throw new Error("Menu not found");
      }

      return updatedMenu;
    } catch (error) {
      this.logAndThrowError("Error updating menu", error);
    }
  };

  getMenu = async (id) => {
    try {
      if (!this.isValidObjectId(id)) {
        throw new Error("Invalid menu ID");
      }

      const menu = await this.menu
        .findById(id)
        .populate("menuType")
        .populate(this.getStockPopulateOptions("starters"))
        .populate(this.getStockPopulateOptions("mainCourses"))
        .populate(this.getStockPopulateOptions("desserts"))
        .populate(this.getStockPopulateOptions("drinks"))
        .populate(this.getStockPopulateOptions("extras"));

      return menu;
    } catch (error) {
      this.logAndThrowError("Error fetching menu", error);
    }
  };

  getAllMenus = async (options = {}) => {
    try {
      const {
        isActive = true,
        menuType = null,
        sort = { name: 1 },
        limit = null,
        skip = 0,
      } = options;

      let query = {};
      if (isActive !== null) query.isActive = isActive;
      if (menuType) query.menuType = menuType;

      let queryBuilder = this.menu
        .find(query)
        .populate("menuType")
        .populate(this.getStockPopulateOptions("starters"))
        .populate(this.getStockPopulateOptions("mainCourses"))
        .populate(this.getStockPopulateOptions("desserts"))
        .populate(this.getStockPopulateOptions("drinks"))
        .populate(this.getStockPopulateOptions("extras"))
        .sort(sort)
        .skip(skip);

      if (limit) queryBuilder = queryBuilder.limit(limit);

      return await queryBuilder;
    } catch (error) {
      this.logAndThrowError("Error fetching all menus", error);
    }
  };

  getGroupedMenuWithWeekdays = async (type) => {
    try {
      const matchStage = {
        $match: {
          isActive: true,
          isDeleted: { $ne: true },
          ...(type ? { "menuTypeInfo.code": type } : {}),
        },
      };

      const pipeline = [
        {
          $lookup: {
            from: "menutypes",
            localField: "menuType",
            foreignField: "_id",
            as: "menuTypeInfo",
          },
        },
        { $unwind: "$menuTypeInfo" },
        matchStage,
        ...this.getStockLookupStages(),
        {
          $project: {
            _id: 1,
            menuType: "$menuTypeInfo",
            name: 1,
            description: 1,
            starters: 1,
            mainCourses: 1,
            desserts: 1,
            drinks: 1,
            extras: 1,
            isActive: 1,
            amount: 1,
            weekday: 1,
            weekdayNumber: { $ifNull: ["$weekday.number", 0] },
          },
        },
        { $sort: { weekdayNumber: 1, name: 1 } },
      ];

      return await this.menu.aggregate(pipeline);
    } catch (error) {
      this.logAndThrowError("Error fetching grouped menu with weekdays", error);
    }
  };

  deleteMenu = async (id) => {
    try {
      if (!this.isValidObjectId(id)) {
        throw new Error("Invalid menu ID");
      }

      const deletedMenu = await this.menu.findByIdAndDelete(id);
      if (!deletedMenu) {
        throw new Error("Menu not found");
      }
      return deletedMenu;
    } catch (error) {
      this.logAndThrowError("Error deleting menu", error);
    }
  };

  // Helper Methods
  isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
  };

  validateMenuData = async (menuData, excludeId = null) => {
    if (!menuData.name || menuData.name.trim().length === 0) {
      throw new Error("Menu name is required");
    }

    if (!menuData.menuType) {
      throw new Error("Menu type is required");
    }

    // Check if menu type exists
    const menuType = await this.getMenuTypeById(menuData.menuType);
    if (!menuType) {
      throw new Error("Menu type not found");
    }

    // Validate arrays
    const requiredArrays = [
      "starters",
      "mainCourses",
      "desserts",
      "drinks",
      "extras",
    ];
    requiredArrays.forEach((field) => {
      if (!Array.isArray(menuData[field])) {
        throw new Error(`${field} must be an array`);
      }
    });
  };

  checkMenuDuplicates = async (menuData, excludeId = null) => {
    const menuType = await this.getMenuTypeById(menuData.menuType);

    // Check for duplicate menu name within same type
    const duplicateQuery = {
      menuType: menuData.menuType,
      weekday: menuData.weekday?.en || null,
      name: { $regex: new RegExp(`^${escapeRegExp(menuData.name)}$`, "i") },
    };

    if (excludeId) {
      duplicateQuery._id = { $ne: excludeId };
    }

    const existingMenu = await this.menu.findOne(duplicateQuery);
    if (existingMenu) {
      throw new Error("A menu with this name and type already exists");
    }

    // Special validation for lunch menus
    if (menuType.code === "lunch" && menuData.weekday?.en) {
      const weekdayQuery = {
        "weekday.en": menuData.weekday.en,
      };

      if (excludeId) {
        weekdayQuery._id = { $ne: excludeId };
      }

      const existingWeekdayMenu = await this.menu.findOne(weekdayQuery);
      if (existingWeekdayMenu) {
        throw new Error("A menu with this weekday already exists");
      }
    }
  };

  getAllMenuItems = (menuData) => {
    return [
      ...(menuData.starters || []),
      ...(menuData.mainCourses || []),
      ...(menuData.desserts || []),
      ...(menuData.drinks || []),
      ...(menuData.extras || []),
    ];
  };

  itemsExist = async (items) => {
    if (!items || items.length === 0) return true;

    const uniqueItemIds = [...new Set(items.map((item) => item.toString()))];

    const existingItemsCount = await this.stockModel.countDocuments({
      _id: { $in: uniqueItemIds },
      isDeleted: { $ne: true },
      isActive: true,
    });

    return existingItemsCount === uniqueItemIds.length;
  };

  getStockPopulateOptions = (field) => ({
    path: field,
    match: { isDeleted: { $ne: true }, isActive: true },
    populate: {
      path: "categoryID",
      model: "Category",
    },
  });

  getStockLookupStages = () => {
    const stockFields = [
      "starters",
      "mainCourses",
      "desserts",
      "drinks",
      "extras",
    ];
    return stockFields.map((field) => ({
      $lookup: {
        from: "stocks",
        localField: field,
        foreignField: "_id",
        as: field,
        pipeline: [{ $match: { isDeleted: { $ne: true }, isActive: true } }],
      },
    }));
  };

  getMenuByWeekName = async (weekname) => {
    try {
      if (!weekname) {
        throw new Error("Weekday name is required");
      }
      return await this.menu.find({ "weekday.en": weekname });
    } catch (error) {
      this.logAndThrowError("Error fetching menu by week name", error);
    }
  };

  getMenuByType = async (menuData) => {
    try {
      if (!menuData.menuType || !menuData.name) {
        throw new Error("Menu type and name are required");
      }

      const escapedName = escapeRegExp(menuData.name);
      const query = {
        menuType: menuData.menuType,
        name: { $regex: new RegExp(`^${escapedName}$`, "i") },
      };

      return await this.menu
        .findOne(query)
        .populate("menuType")
        .populate(this.getStockPopulateOptions("starters"))
        .populate(this.getStockPopulateOptions("mainCourses"))
        .populate(this.getStockPopulateOptions("desserts"))
        .populate(this.getStockPopulateOptions("drinks"))
        .populate(this.getStockPopulateOptions("extras"));
    } catch (error) {
      this.logAndThrowError("Error fetching menu by type", error);
    }
  };

  // Alias for backward compatibility
  findMenuById = async (id) => {
    return await this.getMenu(id);
  };

  // Utility method to get menu statistics
  getMenuStats = async () => {
    try {
      const stats = await this.menu.aggregate([
        {
          $group: {
            _id: null,
            totalMenus: { $sum: 1 },
            activeMenus: {
              $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
            },
            menusByType: {
              $push: {
                type: "$menuType",
                name: "$name",
              },
            },
          },
        },
        {
          $lookup: {
            from: "menutypes",
            localField: "menusByType.type",
            foreignField: "_id",
            as: "typeInfo",
          },
        },
      ]);

      return stats[0] || { totalMenus: 0, activeMenus: 0, menusByType: [] };
    } catch (error) {
      this.logAndThrowError("Error fetching menu statistics", error);
    }
  };
}

export default MenuRepository;
