const BaseRepo = require("./BaseRepository");
const StockModels = require("../models/Stocks");
const mongoose = require("mongoose");

class StockRepository extends BaseRepo {
  constructor(connection) {
    super(connection);
    this.connection = connection;
    this.stockModel = StockModels(connection).Stock;
    this.Category = StockModels(connection).Category;
  }

  /**
   * Adds a new stock item to the database.
   * @param {Object} stock - The stock data to be added.
   * @returns {Promise<Object>} The created stock item.
   */
  addStock = async (stock) => {
    try {
      return await this.stockModel.create(stock);
    } catch (error) {
      this.logAndThrowError(error.message, error);
    }
  };

  /**
   * Retrieves all active, non-deleted stock items with pagination and sorting.
   * @param {number} skip - The number of items to skip (for pagination).
   * @param {number} limit - The number of items to limit the result to (for pagination).
   * @param {Object} sort - The sorting options (e.g., by price, name).
   * @returns {Promise<Array>} The list of stock items.
   */
  getAllStock = async (skip, limit, sort) => {
    try {
      return await this.stockModel
        .find({ isDeleted: false, isActive: true })
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .lean();
    } catch (error) {
      this.logAndThrowError(error.message, error);
    }
  };

  /**
   * Retrieves stock items filtered by category.
   * @param {string} categoryID - The category ID to filter by.
   * @returns {Promise<Array>} The list of stock items within the specified category.
   */
  getCategoryWiseStock = async (categoryID) => {
    try {
      return await this.stockModel
        .find({ categoryID, isDeleted: false, isActive: true })
        .sort({ _id: 1 })
        .populate("categoryID")
        .exec();
    } catch (error) {
      this.logAndThrowError(error.message, error);
    }
  };

  /**
   * Retrieves stock items grouped by category.
   * @returns {Promise<Array>} The stock items grouped by category.
   */
  getGroupByCategory = async () => {
    try {
      return await this.stockModel.aggregate([
        {
          $match: {
            isDeleted: false,
            isActive: true,
            categoryID: { $ne: null, $ne: "" },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "categoryID",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        { $unwind: "$categoryDetails" },
        {
          $group: {
            _id: "$categoryDetails._id",
            categoryEn: { $first: "$categoryDetails.name.en" },
            categoryFi: { $first: "$categoryDetails.name.fi" },
            items: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            categoryName: {
              category: { en: "$categoryEn", fi: "$categoryFi" },
              items: { $ifNull: ["$items", []] },
            },
          },
        },
      ]);
    } catch (error) {
      this.logAndThrowError(error.message, error);
    }
  };

  /**
   * Retrieves stock items grouped by the day of the week.
   * @returns {Promise<Array>} The stock items grouped by the name of the week and day of the week.
   */
  getItemDaysNameWise = async () => {
    return await this.stockModel.aggregate([
      {
        $match: {
          $and: [{ isDeleted: false }, { isActive: true }],
          "nameOfWeek.en": { $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$nameOfWeek.en",
          nameOfWeekEn: { $first: "$nameOfWeek.en" },
          nameOfWeekFi: { $first: "$nameOfWeek.fi" },
          dayOfWeek: { $first: "$dayOfWeek" },
          items: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          categoryName: {
            category: { en: "$nameOfWeekEn", fi: "$nameOfWeekFi" },
            items: "$items",
          },
        },
      },
      { $sort: { dayOfWeek: 1 } },
    ]);
  };

  /**
   * Updates a stock item by its ID.
   * @param {string} stockId - The ID of the stock item to update.
   * @param {Object} updateData - The data to update the stock item with.
   * @returns {Promise<Object>} The updated stock item.
   */
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
      this.logAndThrowError(error.message, error);
    }
  };

  /**
   * Counts the total number of active, non-deleted stock items.
   * @param {Object} searchFilters - The filters to apply when counting stock items.
   * @returns {Promise<number>} The total count of stock items.
   */
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
      this.logAndThrowError(err.message, err);
    }
  };

  /**
   * Counts the total number of stock items in a given category.
   * @param {string} categoryId - The ID of the category to count stock items in.
   * @returns {Promise<number>} The total count of stock items in the specified category.
   */
  getStockCountByCategory = async (categoryId) => {
    const count = await this.stockModel.aggregate([
      {
        $match: {
          isDeleted: false,
          isActive: true,
          category: mongoose.Types.ObjectId(categoryId),
        },
      },
      { $count: "totalCount" },
    ]);
    return count.length > 0 ? count[0].totalCount : 0;
  };

  /**
   * Counts the total number of stock items based on search text.
   * @param {string} searchText - The search text to filter stock items.
   * @param {string} type - The search type ("item" or "category").
   * @param {string} lang - The language of the search text ("en" or "fi").
   * @returns {Promise<number>} The total count of stock items matching the search text.
   */
  getStockCountBySearch = async (searchText, type, lang) => {
    const searchPath =
      lang === "fi"
        ? ["stockName.fi", "description.fi"]
        : ["stockName.en", "description.en"];

    if (type === "item") {
      const count = await this.stockModel.aggregate([
        { $match: { isDeleted: false, isActive: true } },
        {
          $search: {
            index: "name",
            text: {
              query: searchText,
              path: searchPath,
              fuzzy: { maxEdits: 1 },
            },
          },
        },
        { $count: "totalCount" },
      ]);
      return count.length > 0 ? count[0].totalCount : 0;
    }
    return 0;
  };

  /**
   * Retrieves stock items based on search text, type, and pagination.
   * @param {string} search - The search text.
   * @param {string} type - The search type ("item" or "category").
   * @param {number} skip - The number of items to skip (for pagination).
   * @param {number} limit - The number of items to limit the result to (for pagination).
   * @param {string} lang - The language for search.
   * @param {string} sortBy - The field to sort by (e.g., "relevance" or "price").
   * @param {string} sort - The sort order ("asc" or "desc").
   * @returns {Promise<Array>} The list of matching stock items.
   */
  getStockBySearch = async (
    search,
    type,
    skip = 0,
    limit = 10,
    lang = "en",
    sortBy = "relevance",
    sort = "desc"
  ) => {
    if (!search || !["item", "category"].includes(type)) {
      return [];
    }

    const searchPath =
      lang === "fi"
        ? ["stockName.fi", "description.fi"]
        : ["stockName.en", "description.en"];
    const sortDirection = sort === "asc" ? 1 : -1;

    let results;

    if (type === "item") {
      const pipeline = [
        {
          $search: {
            index: "name",
            text: { query: search, path: searchPath, fuzzy: { maxEdits: 1 } },
          },
        },
        { $match: { isDeleted: false, isActive: true } },
        { $skip: skip },
        { $limit: limit },
        { $sort: { [sortBy]: sortDirection } },
      ];

      results = await this.stockModel.aggregate(pipeline);
    }

    return results;
  };

  addCategory = async (category) => {
    try {
      return await this.Category.create(category);
    } catch (error) {
      this.logAndThrowError(error.message, error);
    }
  };

  getAllCategory = async (skip, limit) => {
    try {
      return await this.Category.find({ isDeleted: false, isActive: true })
        .skip(skip)
        .limit(limit);
    } catch (error) {
      this.logAndThrowError(error.message, error);
    }
  };
  getCategoryCount = async () => {
    return this.Category.countDocuments({ isDeleted: false, isActive: true });
  };
  updateCategory = async (categoryID, updateData) => {
    try {
      const updatedCategory = await this.Category.findByIdAndUpdate(
        categoryID,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedCategory) {
        throw new Error("Category not found");
      }
      return updatedCategory;
    } catch (error) {
      this.logAndThrowError(error.message, error);
    }
  };
}

module.exports = StockRepository;
