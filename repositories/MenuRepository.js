const BaseRepo = require("./BaseRepository");
const StockModels = require("../models/Stocks");
const MenuType = require("../models/MenuType");
const Menu = require("../models/Menu");

class MenuRepository extends BaseRepo {
  constructor(connection) {
    super(connection);
    this.connection = connection;
    this.stockModel = StockModels(connection).Stock;
    this.Category = StockModels(connection).Category;
    this.menuTypes = MenuType(connection);
    this.menu = Menu(connection);
  }
  getMenuTypeByCode = async (code) => {
    try {
      return await this.menuTypes.findOne({ code });
    } catch (error) {
      this.logAndThrowError(error.message, error);
    }
  };

  addMenuType = async (menuTypes) => {
    try {
      // Get existing codes
      const existing = await this.menuTypes.find({
        code: { $in: menuTypes.map((m) => m.code) },
      });
      const existingCodes = existing.map((m) => m.code);

      // Filter out ones that already exist
      const newMenuTypes = menuTypes.filter(
        (m) => !existingCodes.includes(m.code)
      );
      // Only insert if there's something new
      if (newMenuTypes.length === 0) {
        return {
          message: "All provided menu types already exist. Nothing inserted.",
        };
      }

      return await this.menuTypes.insertMany(newMenuTypes);
    } catch (error) {
      this.logAndThrowError("Error adding menuTypes", error);
    }
  };

  getMenuTypes = async () => {
    try {
      return await this.menuTypes.find();
    } catch (error) {
      this.logAndThrowError(error.message, error);
    }
  };

  addMenu = async (menuData) => {
    try {
      const existingMenu = await this.getMenuByType(menuData);
      if (existingMenu) {
        throw new Error("A menu with this type already exists.");
      }

      // Create and return the new menu
      return await this.menu.create(menuData);
    } catch (error) {
      this.logAndThrowError("Error adding menu", error);
    }
  };

  getMenuByType = async (menuData) => {
    const existingMenu = await this.menu
      .findOne({
        menuType: menuData.menuType,
        name: { $regex: new RegExp(`^${menuData.name}$`, "i") },
      })
      .populate("menuType")
      .populate({
        path: "starters",
        populate: {
          path: "categoryID",
          model: "Category",
        },
      })
      .populate({
        path: "mainCourses",
        populate: {
          path: "categoryID",
          model: "Category",
        },
      })
      .populate({
        path: "desserts",
        populate: {
          path: "categoryID",
          model: "Category",
        },
      })
      .populate({
        path: "drinks",
        populate: {
          path: "categoryID",
          model: "Category",
        },
      })
      .populate({
        path: "extras",
        populate: {
          path: "categoryID",
          model: "Category",
        },
      });
    return existingMenu;
  };

  getGroupedMenuWithWeekdays = async (type) => {



    return await this.menu.aggregate([
      {
        $lookup: {
          from: "menutypes",
          localField: "menuType",
          foreignField: "_id",
          as: "menuTypeInfo",
        },
      },
      { $unwind: "$menuTypeInfo" },
      {
        $match: {
          isActive: true,
          isDeleted: { $ne: true },
          ...(type ? { "menuTypeInfo.code": type } : {}),
        },
      },
      {
        $lookup: {
          from: "stocks",
          localField: "starters",
          foreignField: "_id",
          as: "starters",
        },
      },
      {
        $lookup: {
          from: "stocks",
          localField: "mainCourses",
          foreignField: "_id",
          as: "mainCourses",
        },
      },
      {
        $lookup: {
          from: "stocks",
          localField: "desserts",
          foreignField: "_id",
          as: "desserts",
        },
      },
      {
        $lookup: {
          from: "stocks",
          localField: "drinks",
          foreignField: "_id",
          as: "drinks",
        },
      },
      {
        $lookup: {
          from: "stocks",
          localField: "extras",
          foreignField: "_id",
          as: "extras",
        },
      },
      {
        $project: {
          _id: 0,
          menuType: "$menuTypeInfo",
          name: "$name",
          description: "$description",
          starters: 1,
          mainCourses: 1,
          desserts: 1,
          drinks: 1,
          extras: 1,
          isActive: 1,
          amount: 1,
        },
      },
    ]);
  };

  getMenu = async (id) => {
    try {
      const menu = await this.menu
        .findById(id)
        .populate("menuType")
        .populate({
          path: "items",
          populate: {
            path: "categoryID",
            model: "Category",
          },
        });
      return menu;
    } catch (error) {
      this.logAndThrowError("Error fetching menu:", error);
    }
  };

  getAllMenus = async () =>
    await this.menu
      .find()
      .populate("menuType")
      .populate({
        path: "items",
        populate: {
          path: "categoryID",
          model: "Category",
        },
      });

  updateMenu = async (id, menuData) => {
    try {
      if (menuData.menuType) {
        const existingMenu = await this.menu.findOne({
          _id: { $ne: id }, // exclude current menu from search
          menuType: menuData.menuType,
        });

        if (existingMenu) {
          throw new Error("A menu with this type already exists.");
        }
      }

      // Update the menu
      const updatedMenu = await this.menu.findByIdAndUpdate(id, menuData, {
        new: true,
        runValidators: true,
      });

      if (!updatedMenu) {
        throw new Error("Menu not found");
      }

      return updatedMenu;
    } catch (error) {
      this.logAndThrowError("Error updating menu", error);
    }
  };

  deleteMenu = async (id) => {
    try {
      const deletedMenu = await this.menu.findByIdAndDelete(id);
      return deletedMenu;
    } catch (error) {
      throw new Error("Error deleting menu: " + error.message);
    }
  };
  findMenuById = async (id) => {
    try {
      const menu = await this.menu
        .findById(id)
        .populate("menuType")
        .populate({
          path: "items",
          populate: {
            path: "categoryID",
            model: "Category",
          },
        });
      return menu;
    } catch (error) {
      throw new Error("Error fetching menu: " + error.message);
    }
  };
}
module.exports = MenuRepository;
