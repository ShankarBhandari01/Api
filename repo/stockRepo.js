const BaseRepo = require("./BaseRepo");
const { UpdateError } = require("../utils/errors");
const { Category } = require("../model/Stocks");
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
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ _id: 1 });
    } catch (err) {
      throw new Error(`Error fetching stock items ${err.message}`);
    }
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
  getStockCount = async () => {
    try {
      const count = await this.stockModel.countDocuments();
      return count;
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

    if (type == "item") {
      results = await this.stockModel.aggregate([
        {
          $search: {
            index: "default", // the name of your search index
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
    } else if (type == "category") {
      // Search in the categories collection
      results = await Category.aggregate([
        {
          $search: {
            index: "default", // your category index
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
      const saveCategory = await Category.create(category);
      return saveCategory;
    } catch (error) {
      throw new Error("error adding category: " + error.message);
    }
  };

  getAllCategory = async () => {
    try {
      const category = await Category.find();
      return category;
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
