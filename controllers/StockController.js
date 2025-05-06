import StockDTO from "../dtos/StockDTO.js";
import CategoryDTO from "../dtos/CategoryDTO.js";
import BaseController from "./BaseController.js";

class StockController extends BaseController {
  constructor({ req, res, stockService }) {
    super(req, res);
    this.stockService = stockService;
  }
  updateImageUrl(item, req) {
    return {
      ...item,
      image: item.image
        ? `${req.protocol}://${req.get("host")}/public/${item.image}`
        : null,
    };
  }

  async saveStock() {
    try {
      const lang = this.req.session.lang || "en";
      const stockDto = new StockDTO(this.req.body, this.req.files, lang);
      const response = await this.stockService.addStock(stockDto);
      this.res.statusCode = response.statusCode;
      return this.res.json(response);
    } catch (err) {
      return this.sendError(err);
    }
  }

  async addCategory() {
    try {
      const lang = this.req.session.lang || "en";
      const categoryDto = new CategoryDTO(this.req.body);
      const response = await this.stockService.addCategory(categoryDto, lang);

      this.res.statusCode = response.statusCode;
      return this.res.json(response);
    } catch (err) {
      return this.sendError(err);
    }
  }

  async getAllCategory() {
    try {
      const lang = this.req.session.lang || "en";
      const page = parseInt(this.req.query.page) || 1;
      const limit = parseInt(this.req.query.limit) || 99;

      if (limit > 100) {
        throw { message: "Limit must be less than 100" };
      }

      const response = await this.stockService.getAllCategory(page, limit);

      this.res.statusCode = response.statusCode;
      return this.res.json(response);
    } catch (err) {
      return this.sendError(err);
    }
  }

  async getAllStock() {
    try {
      const lang = this.req.session.lang || "en";

      const {
        search = "",
        searchType = "",
        filterType = "",
        categoryId = "",
        sort = "",
        sortBy = "",
      } = this.req.query;

      const page = parseInt(this.req.query.page) || 1;
      const limit = parseInt(this.req.query.limit) || 10;

      if (limit >= 100) {
        throw { message: "Limit must be less than 100" };
      }

      const searchFilters = {
        searchText: search,
        type: searchType,
        filterType,
        categoryId,
        sort,
        sortBy,
        page,
        limit,
        lang,
      };

      const response = await this.stockService.getAllStock(searchFilters);

      if (response.statusCode === 200) {
        if (response.rsType === "Allstock" && response.data.length > 0) {
          response.data = response.data.map((item) =>
            this.updateImageUrl(item, this.req)
          );
        } else if (
          (response.rsType === "categoryWise" ||
            response.rsType === "nameOfWeekWise") &&
          response.data.length > 0
        ) {
          response.data = response.data.map((category) => ({
            ...category,
            categoryName: {
              ...category.categoryName,
              items: category.categoryName.items.map((item) =>
                this.updateImageUrl(item, this.req)
              ),
            },
          }));
        }
      }

      this.res.statusCode = response.statusCode;
      return this.res.json(response);
    } catch (err) {
      return this.sendError(err);
    }
  }

  async searchCategory() {
    try {
      const {
        searchTerm = "",
        page = 1,
        limit = 10,
        lang = "en",
      } = this.req.query;
      await this.runServiceMethod(
        this.stockService,
        async (service) => {
          return await service.searchCategory(
            searchTerm,
            parseInt(page),
            parseInt(limit),
            lang
          );
        },
        "Categories fetched successfully"
      );
    } catch (err) {
      this.sendError(err);
    }
  }
}

export default StockController;
