const BaseRepo = require("./BaseRepository");
const { UpdateError } = require("../utils/errors");
const { Category } = require("../models/Stocks");

class StockRepository extends BaseRepo {
  constructor(stockModel) {
    super();
    this.stockModel = stockModel;
  }

  addStock = (stock) => {
    return this.stockModel.create(stock);
  };

  getAllStock = async (skip, limit) => {
    try {
      return await this.stockModel
        .find({ isDeleted: false, isActive: true })
        .skip(skip)
        .limit(limit)
        .sort({ _id: 1 })
        .lean();
    } catch (err) {
      throw new Error(`Error fetching stock items ${err.message}`);
    }
  };
  getCategoryWiseStock = async (categoryID) => {
    try {
      return await this.stockModel
        .find({ categoryID: categoryID, isDeleted: false, isActive: true })
        .sort({ _id: 1 })
        .populate("categoryID")
        .exec();
    } catch (error) {
      console.error("Error fetching categoryWise stock:", error);
      throw new Error(`Error retrieving stock: ${error.message}`);
    }
  };

  getGroupByCategory = async () => {
    try {
      return await this.stockModel.aggregate([
        {
          $match: {
            isDeleted: false,
            isActive: true,
            categoryID: {$ne: null, $ne: ""},
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "categoryID", // Field in stockModel (references category)
            foreignField: "_id", // Field in categories collection
            as: "categoryDetails",
          },
        },
        {
          $unwind: "$categoryDetails", // Flatten categoryDetails to a single object
        },
        {
          $group: {
            _id: "$categoryDetails._id", // Group by category ID
            categoryEn: {$first: "$categoryDetails.name.en"}, // Get English name
            categoryFi: {$first: "$categoryDetails.name.fi"}, // Get Finnish name
            items: {$push: "$$ROOT"}, // Push stock items under each category
          },
        },
        {
          $project: {
            _id: 0, // Exclude default _id
            categoryName: {
              category: {
                en: "$categoryEn", // English name
                fi: "$categoryFi", // Finnish name
              },
              items: {$ifNull: ["$items", []]}, // Ensure items is an empty array if no items exist
            },
          },
        },
      ]);
    } catch (error) {
      console.error("Error fetching category-wise stock:", error);
      throw new Error(`Error retrieving stock: ${error.message}`);
    }
  };
  getItemDaysNameWise = async () => {
    return await this.stockModel.aggregate([
      {
        $match: {
          $and: [{isDeleted: false}, {isActive: true}],
          "nameOfWeek.en": {$ne: null, $ne: ""},
        },
      },
      {
        $group: {
          _id: "$nameOfWeek.en",
          nameOfWeekEn: {$first: "$nameOfWeek.en"},
          nameOfWeekFi: {$first: "$nameOfWeek.fi"},
          dayOfWeek: {$first: "$dayOfWeek"},
          items: {$push: "$$ROOT"},
        },
      },
      {
        $project: {
          _id: 0,
          categoryName: {
            category: {
              en: "$nameOfWeekEn",
              fi: "$nameOfWeekFi",
            },
            items: "$items",
          },
        },
      },
      {
        $sort: {dayOfWeek: 1},
      },
    ]);
  };

  updateStock = async (stockId, updateData) => {
    try {
      const updatedStock = await this.stockModel.findByIdAndUpdate(
        stockId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedStock) {
        throw new Error("Stock not found");
      }
      return updatedStock;
    } catch (error) {
      throw new UpdateError(`Error updating stock: ${error.message}`);
    }
  };
  getStockCount = async (searchFilters) => {
    try {
      if (searchFilters) {
        return await this.stockModel.countDocuments({
          categoryID: searchFilters.categoryId,
          isDeleted: false,
          isActive: true,
        });
      }
      return await this.stockModel.countDocuments({
        isDeleted: false,
        isActive: true,
      });
    } catch (err) {
      throw new Error("Error counting stock items: " + err.message);
    }
  };

  getStockBySearch = async (search, type, skip, limit, lang) => {
    let results;
    const searchPath =
      lang === "fi"
        ? ["stockName.fi", "description.fi"]
        : ["stockName.en", "description.en"]; // Default to 'en' if not 'fi'

    if (type === "item") {
      results = await this.stockModel.aggregate([
        {
          $match: {
            isDeleted: false,
            isActive: true,
          },
          $search: {
            index: "name", // the name of your search index
            text: {
              query: search,
              path: searchPath, // fields to search
              fuzzy: { maxEdits: 1 },
            },
          },
        },
        {
          $skip: skip, // Skip documents based on the page number
        },
        {
          $limit: limit, // Limit the number of results (page size)
        },
      ]);
    } else if (type === "category") {
      // Search in the categories collection
      results = await Category.aggregate([
        {
          $match: {
            isDeleted: false,
            isActive: true,
          },
          $search: {
            index: "name", // your category index
            text: {
              query: search,
              path: ["name.en"], // assuming you are searching by category name
              fuzzy: { maxEdits: 1 },
            },
          },
        },
        {
          $skip: skip, // Skip documents based on the page number
        },
        {
          $limit: limit, // Limit the number of results (page size)
        },
      ]);
    }
    return results; // Return the results
  };

  addCategory = async (category) => {
    try {
      return await Category.create(category);
    } catch (error) {
      throw new Error("error adding category: " + error.message);
    }
  };

  getAllCategory = async () => {
    try {
      return await Category.find({ isDeleted: false, isActive: true });
    } catch (error) {
      throw new Error("getting category: " + error.message);
    }
  };
  updateCategory = async (categoryID, updateData) => {
    try {
      const updatedCategory = await Category.findByIdAndUpdate(
        categoryID,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedCategory) {
        throw new Error("Category not found");
      }
      return updatedCategory;
    } catch (error) {
      throw new UpdateError(`Error updating category: ${error.message}`);
    }
  };
}

module.exports = {
  StockRepository,
};
