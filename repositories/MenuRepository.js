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

  addMenu = async (menuData) => {
    try {
      const existingMenu = await this.getMenuByType(menuData.menuType);
      if (existingMenu) {
        throw new Error("A menu with this type already exists.");
      }

      // Create and return the new menu
      return await this.menu.create(menuData);
    } catch (error) {
      this.logAndThrowError("Error adding menu", error);
    }
  };

  getMenuByType = async (menuTypes) => {
    const existingMenu = await this.menu
      .findOne({
        menuType: menuTypes,
      })
      .populate("menuType")
      .populate({
        path: "items",
        populate: {
          path: "categoryID",
          model: "Category",
        },
      });
    return existingMenu;
  };

  getGroupedMenuWithWeekdays = async () => {
    return await this.menu.aggregate([
      {
        $lookup: {
          from: "stocks",
          localField: "items",
          foreignField: "_id",
          as: "items",
        },
      },
      { $unwind: "$items" },
      {
        $match: {
          "items.isDeleted": false,
          "items.isActive": true,
          "items.nameOfWeek.en": { $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: {
            menuType: "$menuType",
            day: "$items.nameOfWeek.en",
          },
          menuTypeId: { $first: "$menuType" },
          nameOfWeekEn: { $first: "$items.nameOfWeek.en" },
          nameOfWeekFi: { $first: "$items.nameOfWeek.fi" },
          dayOfWeek: { $first: "$items.dayOfWeek" },
          items: { $addToSet: "$items" },
        },
      },
      {
        $group: {
          _id: "$menuTypeId",
          category: {
            $push: {
              name: { en: "$nameOfWeekEn", fi: "$nameOfWeekFi" },
              dayOfWeek: "$dayOfWeek",
              items: "$items",
            },
          },
        },
      },
      {
        $lookup: {
          from: "menutypes",
          localField: "_id",
          foreignField: "_id",
          as: "menuTypeInfo",
        },
      },
      { $unwind: "$menuTypeInfo" },
      {
        $project: {
          _id: 0,
          menuType: {
            name: "$menuTypeInfo.name",
            code: "$menuTypeInfo.code",
            category: "$category",
          },
        },
      },
      {
        $sort: {
          "menuType.category.dayOfWeek": 1,
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
