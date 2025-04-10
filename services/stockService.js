const { StockRepository } = require("../repositories/stockRepo");
const BaseService = require("./BaseService");
const StockModels = require("../models/Stocks");

class StockService extends BaseService {
  constructor(connection) {
    super(connection);
    this.connection = connection;
    this.Stock = StockModels(this.connection).Stock;
    this.Category = StockModels(this.connection).Category;
    this.stockRepo = new StockRepository(connection);
  }

  addStock = async (StockDto) => {
    try {
      let insertedStock;
      const stockModel = new this.Stock(StockDto);

      // Handle image upload
      if (StockDto.image && StockDto.image.image?.[0]?.filename) {
        stockModel.image = StockDto.image.image[0].filename;
      }
      // check the mode of the transaction
      if (StockDto.mode === "new") {
        insertedStock = await this.stockRepo.addStock(stockModel);
      } else if (StockDto.mode === "edit" || StockDto.mode === "delete") {
        stockModel.updated_ts = Date.now();
        if (StockDto.mode === "edit") {
          stockModel.remarks = { en: "edit", fi: "muokata" };
        } else {
          stockModel.remarks = { en: "delete", fi: "poista" };
          stockModel.isDeleted = true;
          stockModel.isActive = false;
        }
        const { _id, createdDate, ...updateData } = stockModel.toObject();

        insertedStock = await this.stockRepo.updateStock(
          StockDto.id,
          updateData
        );
      } else {
        throw new Error("Invalid mode");
      }
      return super.prepareResponse(insertedStock);
    } catch (err) {
      throw { message: err.message };
    }
  };

  getAllStock = async (searchFilters) => {
    let response = {};
    let totalCount = 0;

    try {
      const {
        filterType,
        categoryId,
        searchText,
        type,
        page = 1,
        limit = 10,
        lang,
      } = searchFilters;

      const skip = this.getSkipNumber(page, limit);

      // Determine totalCount only if necessary
      if (filterType === "categoryWise" && categoryId) {
        totalCount = await this.stockRepo.getStockCount(searchFilters);
      } else {
        totalCount = await this.stockRepo.getStockCount();
      }

      // Reset skip if total items are less than one page
      const finalSkip = totalCount < 20 ? 0 : skip;

      let stock;
      let rsType;

      // Handle search text
      if (searchText && type === "item") {
        stock = await this.stockRepo.getStockBySearch(
          searchText,
          type,
          finalSkip,
          limit,
          lang
        );
        rsType = "stock";
      } else {
        switch (filterType) {
          case "categoryWise":
            if (!categoryId) {
              stock = await this.stockRepo.getGroupByCategory();
            } else {
              stock = await this.stockRepo.getCategoryWiseStock(categoryId);
            }
            rsType = "categoryWise";
            break;

          case "nameOfWeekWise":
            stock = await this.stockRepo.getItemDaysNameWise();
            rsType = "nameOfWeekWise";
            break;

          default:
            stock = await this.stockRepo.getAllStock(finalSkip, limit, {
              _id: 1,
            });
            rsType = "Allstock";
            break;
        }
      }

      response = super.prepareResponse(stock, rsType);

      // Add pagination only if stock exists
      if (Array.isArray(stock) && stock.length > 0) {
        response.pagination = {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
        };
      }

      return response;
    } catch (err) {
      throw { message: err.message };
    }
  };

  addCategory = async (category, lang) => {
    try {
      let insertedCategory;

      // parsing dto to category class
      const categoryModel = new this.Category(category);
      // Add the category to the repository
      if (category.mode === "new") {
        insertedCategory = await this.stockRepo.addCategory(categoryModel);
      } else if (category.mode === "edit" || category.mode === "delete") {
        if (category.mode === "edit") {
          categoryModel.updated_at = Date.now();
          categoryModel.remarks = { en: "edit", fi: "muokata" };
        } else if (category.mode === "delete") {
          categoryModel.updated_at = Date.now();
          categoryModel.remarks = { en: "delete", fi: "poista" };
          categoryModel.isDeleted = true;
          categoryModel.isActive = false;
        }
        // Remove _id to prevent immutable field error
        const { _id, created_at, ...updateData } = categoryModel.toObject();
        insertedCategory = await this.stockRepo.updateCategory(
          category.id,
          updateData
        );
      } else {
        throw new Error("Invalid mode");
      }

      return super.prepareResponse(insertedCategory);
    } catch (err) {
      throw { message: err.message };
    }
  };

  getAllCategory = async (page, limit) => {
    try {
      const skip = this.getSkipNumber(page, limit);

      const [responseResults, totalCount] = await Promise.all([
        this.stockRepo.getAllCategory(skip, limit),
        this.stockRepo.getCategoryCount(),
      ]);

      const response = super.prepareResponse(responseResults);

      // Add pagination only if stock exists
      if (Array.isArray(responseResults) && responseResults.length > 0) {
        response.pagination = {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
        };
      }
      return response;
    } catch (err) {
      throw { message: err.message };
    }
  };
}

module.exports = {
  StockService,
};
