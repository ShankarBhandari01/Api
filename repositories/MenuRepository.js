import BaseRepo from "./BaseRepository.js";
import StockModels from "../models/Stocks.js";
import MenuType from "../models/MenuType.js";
import Menu from "../models/Menu.js";
import pkg from 'lodash';
const { escapeRegExp } = pkg;

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
  getMenuTypeById = async (id) => await this.menuTypes.findById(id);

  addMenu = async (menuData) => {
    try {
      // Check if the menu type exists
      const menuType = await this.getMenuTypeById(menuData.menuType);
      if (!menuType) {
        throw new Error("Menu type not found");
      }
      // Check if the menu with the same type and name already exists
      const existingMenu = await this.getMenuByType(menuData);
      if (existingMenu) {
        throw new Error("A menu with this type already exists.");
      }
      // Validate stock items exist for starters, mainCourses, desserts, drinks, and extras
      const allItemsValid = await this.itemsExist([
        ...menuData.starters,
        ...menuData.mainCourses,
        ...menuData.desserts,
        ...menuData.drinks,
        ...menuData.extras,
      ]);
      // Check if all items are valid
      if (!allItemsValid) {
        throw new Error("One or more stock items are invalid or not active.");
      }

      // Create and return the new menu
      return await this.menu.create(menuData);
    } catch (error) {
      this.logAndThrowError("Error adding menu", error);
    }
  };

  // Function to check if all stock items exist
  itemsExist = async (items) => {
    const itemIds = items.map((item) => item);
    const uniqueItemIds = [...new Set(itemIds)];

    // Check if all items exist in the StockModel
    const existingItemsCount = await this.stockModel.countDocuments({
      _id: { $in: uniqueItemIds },
      isDeleted: false,
      isActive: true,
    });

    return existingItemsCount === uniqueItemIds.length;
  };

  getMenuByType = async (menuData) => {
    const escapedName = escapeRegExp(menuData.name);
    const query = { name: { $regex: new RegExp(`^${escapedName}$`, "i") } };

    const existingMenu = await this.menu
      .findOne({
        menuType: menuData.menuType,
        "weekday.en": menuData.weekday.en,
        name: query,
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
        //  isActive: true,
       //   isDeleted: { $ne: true },
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
          _id: 1,
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
          weekday: 1,
          weekdayNumber: { $ifNull: ["$weekday.number", 0] },
        },
      },
      {
        $sort: { weekdayNumber: 1 },
      },
    ]);
  };

  getMenu = async (id) => {
    try {
      const menu = await this.menu
        .findById(id)
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

  updateMenu = async (id, menuData) => {
    try {
      if (menuData.menuType) {
        // Check if the menu type exists
        const menuType = await this.getMenuTypeById(menuData.menuType);
        if (!menuType) {
          throw new Error("Menu type not found");
        }
        // Check if the menu with the same type and name already exists
        const existingMenu = await this.menu.findOne({
          _id: { $ne: id }, // exclude current menu from search
          menuType: menuData.menuType,
        });

        if (existingMenu) {
          throw new Error("A menu with this type already exists.");
        }
      }
      // Validate stock items exist for starters, mainCourses, desserts, drinks, and extras
      const allItemsValid = await this.itemsExist([
        ...menuData.starters,
        ...menuData.mainCourses,
        ...menuData.desserts,
        ...menuData.drinks,
        ...menuData.extras,
      ]);
      // Check if all items are valid
      if (!allItemsValid) {
        throw new Error("One or more stock items are invalid or not active.");
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
      this.logAndThrowError("Error deleting menu", error);
    }
  };
  deleteMenuType = async (id) => {
    try {
      const deletedMenuType = await this.menuTypes.findByIdAndDelete(id);
      if (!deletedMenuType) {
        throw new Error("Menu type not found");
      }
      return deletedMenuType;
    } catch (error) {
      this.logAndThrowError("Error deleting menu type", error);
    }
  };
  findMenuById = async (id) => {
    try {
      const menu = await this.menu
        .findById(id)
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
      return menu;
    } catch (error) {
      throw new Error("Error fetching menu: " + error.message);
    }
  };
}
export default MenuRepository;
