import BaseRepo from "./BaseRepository.js";
import StockModels from "../models/Stocks.js";
import MenuType from "../models/MenuType.js";
import { Types } from "mongoose";

class StockRepository extends BaseRepo {
  constructor({ connection }) {
    super(connection);
    this.connection = connection;
    this.stockModel = StockModels(connection).Stock;
    this.Category = StockModels(connection).Category;
    this.menuTypes = MenuType(connection);
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

  // Function to sort stocks based on numeric value extracted from stockName
  sortStocksByNumericValue = (stocks, sort = "asc") => {
    try {
      // Clone the stocks array to avoid in-place mutation
      const stocksCopy = [...stocks];
      return stocksCopy.sort((a, b) => {
        // Extract the first numeric part of stockName.en
        const numA = a.stockName.en.split(".")[0];
        const numB = b.stockName.en.split(".")[0];
        // Convert to numeric values, treating non-numeric as Infinity
        const numericA = isNaN(numA) ? Infinity : parseInt(numA, 10);
        const numericB = isNaN(numB) ? Infinity : parseInt(numB, 10);
        // Sort based on the specified order
        return sort === "asc" ? numericA - numericB : numericB - numericA;
      });
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
  getAllStock = async (skip, limit, sort = "asc") => {
    try {
      const stocks = await this.stockModel
        .find({ isDeleted: false, isActive: true })
        .skip(skip)
        .limit(limit)
        .lean();

      return this.sortStocksByNumericValue(stocks, sort);
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
      const stocks = await this.stockModel
        .find({ categoryID, isDeleted: false, isActive: true })
        .populate("categoryID")
        .sort({ "categoryID.categoryName": 1, "stockName.en": 1 })
        .lean()
        .exec();

      return this.sortStocksByNumericValue(stocks);
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
      const stocks = await this.stockModel.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "categoryID",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        {
          $unwind: {
            path: "$categoryDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            isDeleted: false,
            isActive: true,
            categoryID: { $exists: true, $ne: "" },
            "categoryDetails.isDeleted": false,
            "categoryDetails.isActive": true,
          },
        },
        {
          $group: {
            _id: "$categoryDetails._id",
            categoryEn: { $first: "$categoryDetails.name.en" },
            categoryFi: { $first: "$categoryDetails.name.fi" },
            isLunchCategory: { $first: "$categoryDetails.isLunchCategory" },
            items: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 1,
            categoryName: {
              category: { en: "$categoryEn", fi: "$categoryFi" },
              isLunchCategory: "$isLunchCategory",
              items: { $ifNull: ["$items", []] },
            },
          },
        },
      ]);

      const sortedStocks = stocks
        // Step 1: Sort categories based on the minimum numeric value of their items
        .map((group) => {
          const itemsCopy = [...group.categoryName.items];

          const minNumericValue = itemsCopy.reduce((min, item) => {
            const num = parseInt(item.stockName.en.split(".")[0], 10);
            return isNaN(num) ? min : Math.min(min, num);
          }, Infinity);

          return {
            ...group,
            minNumericValue,
            items: itemsCopy,
          };
        })
        // Step 2: Sort categories based on the minimum numeric value
        .sort((a, b) => a.minNumericValue - b.minNumericValue)
        // Step 3: Sort items within each category
        .map((group) => {
          const sortedItems = group.items.sort((a, b) => {
            const numA = parseInt(a.stockName.en.split(".")[0], 10);
            const numB = parseInt(b.stockName.en.split(".")[0], 10);

            // Primary sorting by numeric part ascending
            if (numA < numB) return -1;
            if (numA > numB) return 1;

            // If numeric parts are equal, sort by full stockName.en lexicographically
            return a.stockName.en.localeCompare(b.stockName.en);
          });

          return {
            ...group,
            categoryName: {
              ...group.categoryName,
              items: sortedItems,
            },
          };
        });

      const filteredStocks = sortedStocks.filter(
        (group) => group.categoryName.isLunchCategory === false
      );
      return filteredStocks;
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
      const result = await this.stockModel.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "categoryID", // Field in the stock document
            foreignField: "_id", // Field in the category document
            as: "category",
          },
        },
        {
          $unwind: "$category",
        },
        {
          $match: {
            isDeleted: false,
            isActive: true,
            "category.isDeleted": false, // Ensure the category is not deleted
          },
        },
        {
          $count: "totalCount", // Count the matching documents
        },
      ]);
      const count = result.length > 0 ? result[0].totalCount : 0;

      return count;
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
          category: Types.ObjectId(categoryId),
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
        {
          $search: {
            index: "default",
            text: {
              query: searchText,
              path: searchPath,
              fuzzy: { maxEdits: 1 },
            },
          },
        },
        { $match: { isDeleted: false, isActive: true } },
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
            index: "default",
            text: { query: search, path: searchPath },
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

  searchCategory = async (searchTerm, skip, limit, lang = "en") => {
    const query = {
      isDeleted: false,
    };

    if (searchTerm) {
      query[`name.${lang}`] = { $regex: searchTerm, $options: "i" };
    }

    return this.Category.find(query).skip(skip).limit(limit).lean();
  };

  countSearchCategory = async (searchTerm, lang = "en") => {
    const query = {
      isDeleted: false,
    };

    if (searchTerm) {
      query[`name.${lang}`] = { $regex: searchTerm, $options: "i" };
    }

    return this.Category.countDocuments(query);
  };
}

export default StockRepository;
