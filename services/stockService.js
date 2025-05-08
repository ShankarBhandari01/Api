import BaseService from "./BaseService.js";
import StockModels from "../models/Stocks.js";
import escapeStringRegexp from "escape-string-regexp";

class StockService extends BaseService {
  constructor({ connection, stockRepository, redisSocketService }) {
    super(connection);
    this.connection = connection;
    this.Stock = StockModels(this.connection).Stock;
    this.Category = StockModels(this.connection).Category;
    this.stockRepo = stockRepository;
    this.redisSocketService = redisSocketService;
  }

  // Add or edit or delete stock
  addStock = async (StockDto) => {
    try {
      let insertedStock;
      const stockModel = new this.Stock(StockDto);

      if (StockDto.image && StockDto.image.image?.[0]?.filename) {
        stockModel.image = StockDto.image.image[0].filename;
      } else {
        stockModel.image = null;
      }

      if (StockDto.mode === "new") {
        insertedStock = await this.stockRepo.addStock(stockModel);
      } else if (StockDto.mode === "edit" || StockDto.mode === "delete") {
        stockModel.updated_ts = Date.now();
        stockModel.remarks = {
          en: StockDto.mode,
          fi: StockDto.mode === "edit" ? "muokata" : "poista",
        };

        if (StockDto.mode === "delete") {
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

      // Invalidate cache
      await this.redisSocketService.delCacheKey("stock:*");

      return super.prepareResponse(insertedStock);
    } catch (err) {
      throw { message: err.message, stack: err.stack };
    }
  };

  // Get all stock with caching
  getAllStock = async (searchFilters) => {
    let response = {};
    let totalCount = 0;

    try {
      let {
        filterType,
        categoryId,
        searchText,
        type,
        page = 1,
        limit = 10,
        lang,
        sortBy = "createdDate",
        sort = "desc",
      } = searchFilters;

      if (!sortBy) sortBy = "createdDate";
      if (!sort) sort = "desc";

      const skip = this.getSkipNumber(page, limit);
      const cacheKey = `stock:filter:${filterType || "all"}:cat:${
        categoryId || "none"
      }:txt:${searchText || "none"}:type:${type || "none"}:lang:${
        lang || "en"
      }:pg:${page}:lim:${limit}:sortBy:${sortBy}:sort:${sort}`;

      const cached = await this.redisSocketService.getCacheValue(cacheKey);
      if (cached) return cached;

      if (searchText && type === "item") {
        totalCount = await this.stockRepo.getStockCountBySearch(
          searchText,
          type,
          lang
        );
      } else if (filterType === "categoryWise" && categoryId) {
        totalCount = await this.stockRepo.getStockCountByCategory(categoryId);
      } else {
        totalCount = await this.stockRepo.getStockCount();
      }

      const finalSkip = totalCount < limit ? 0 : skip;

      let stock;
      let rsType;

      if (searchText && type === "item") {
        stock = await this.stockRepo.getStockBySearch(
          searchText,
          type,
          finalSkip,
          limit,
          lang,
          sortBy,
          sort
        );
        rsType = "stock";
      } else {
        switch (filterType) {
          case "categoryWise":
            stock = categoryId
              ? await this.stockRepo.getCategoryWiseStock(
                  categoryId,
                  finalSkip,
                  limit
                )
              : await this.stockRepo.getGroupByCategory();
            rsType = "categoryWise";
            break;

          case "nameOfWeekWise":
            stock = await this.stockRepo.getItemDaysNameWise(finalSkip, limit);
            rsType = "nameOfWeekWise";
            break;

          default:
            stock = await this.stockRepo.getAllStock(finalSkip, limit);
            rsType = "Allstock";
            break;
        }
      }

      response = super.prepareResponse(stock, rsType);

      if (Array.isArray(stock) && stock.length > 0) {
        response.pagination = {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
        };
      }

      await this.redisSocketService.setCacheValue(cacheKey, response, 60);
      return response;
    } catch (err) {
      throw { message: err.message, stack: err.stack };
    }
  };

  // Add/edit/delete category
  addCategory = async (category) => {
    try {
      let insertedCategory;
      const categoryModel = new this.Category(category);

      if (category.mode === "new") {
        insertedCategory = await this.stockRepo.addCategory(categoryModel);
      } else if (category.mode === "edit" || category.mode === "delete") {
        categoryModel.updated_at = Date.now();
        categoryModel.remarks = {
          en: category.mode,
          fi: category.mode === "edit" ? "muokata" : "poista",
        };

        if (category.mode === "delete") {
          categoryModel.isDeleted = true;
          categoryModel.isActive = false;
        }

        const { _id, created_at, ...updateData } = categoryModel.toObject();
        insertedCategory = await this.stockRepo.updateCategory(
          category.id,
          updateData
        );
      } else {
        throw new Error("Invalid mode");
      }

      // Invalidate cache
      await this.redisSocketService.delCacheKey("category:*");

      return super.prepareResponse(insertedCategory);
    } catch (err) {
      throw { message: err.message, stack: err.stack };
    }
  };

  // Get all categories with pagination & cache
  getAllCategory = async (page, limit) => {
    try {
      const skip = this.getSkipNumber(page, limit);
      const cacheKey = `category:pg:${page}:lim:${limit}`;

      const cached = await this.redisSocketService.getCacheValue(cacheKey);
      if (cached) return cached;

      const [responseResults, totalCount] = await Promise.all([
        this.stockRepo.getAllCategory(skip, limit),
        this.stockRepo.getCategoryCount(),
      ]);

      const response = super.prepareResponse(responseResults);

      if (Array.isArray(responseResults) && responseResults.length > 0) {
        response.pagination = {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
        };
      }

      await this.redisSocketService.setCacheValue(cacheKey, response, 60);
      return response;
    } catch (err) {
      throw { message: err.message, stack: err.stack };
    }
  };

  // Search category with caching
  searchCategory = async (searchTerm, page = 1, limit = 10, lang = "en") => {
    try {
      if (!["en", "fi"].includes(lang)) {
        throw new Error('Unsupported language. Use "en" or "fi".');
      }

      const safeSearchTerm = escapeStringRegexp(searchTerm?.trim?.() || "");
      const skip = this.getSkipNumber(page, limit);
      const cacheKey = `category:search:${safeSearchTerm}:pg:${page}:lim:${limit}:lang:${lang}`;

      const cached = await this.redisSocketService.getCacheValue(cacheKey);
      if (cached) return cached;

      const [results, totalCount] = await Promise.all([
        this.stockRepo.searchCategory(safeSearchTerm, skip, limit, lang),
        this.stockRepo.countSearchCategory(safeSearchTerm, lang),
      ]);

      const response = super.prepareResponse(results);

      if (Array.isArray(results) && results.length > 0) {
        response.pagination = {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
        };
      }

      await this.redisSocketService.setCacheValue(cacheKey, response, 60);
      return response;
    } catch (err) {
      this.logAndThrowError(err.message, err);
    }
  };
}

export default StockService;
