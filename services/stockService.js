/**
 * Constructor for StockService
 * @param {StockRepository} stockRepo - An instance of the StockRepository class.
 */

const resources = require("../utils/constants");
const {Stock, Category} = require("../model/Stocks");
const BaseService = require("./BaseService");
const {Types} = require("mongoose");

class StockService extends BaseService {
    constructor(stockRepo) {
        super();
        this.stockRepo = stockRepo;
    }

    addStock = async (StockDto) => {
        try {
            let insertedStock;
            const stockModel = new Stock(StockDto);

            // Handle image upload
            if (StockDto.image && StockDto.image.image?.[0]?.filename) {
                stockModel.image = StockDto.image.image[0].filename;
            }
            // check the mode of the transcation
            if (StockDto.mode === "new") {
                insertedStock = await this.stockRepo.addStock(stockModel);
            } else {
                stockModel.updated_ts = Date.now();
                stockModel.remarks = {en: "edit", fi: "muokata"};

                const {_id, createdDate, ...updateData} = stockModel.toObject();

                insertedStock = await this.stockRepo.updateStock(
                    StockDto.id,
                    updateData
                );
            }
            return super.prepareResponse(insertedStock);
        } catch (err) {
            throw {message: err.message};
        }
    };

    getAllStock = async (searchFilters) => {
        let response = {};
        let totalCount;

        try {
            if (searchFilters.filterType === "categoryWise" && searchFilters.categoryId) {
                totalCount = await this.stockRepo.getStockCount(searchFilters);
            } else {
                totalCount = await this.stockRepo.getStockCount();
            }

            // Calculate the skip value for pagination
            let skip = this.getSkipNumber(searchFilters.page, searchFilters.limit);
            // set skip to 0 if less than 20
            if (totalCount < 20) {
                skip = 0;
            }

            let stock;
            if (searchFilters.searchText && searchFilters.type === "item") {
                stock = await this.stockRepo.getStockBySearch(
                    searchFilters.searchText,
                    searchFilters.type,
                    skip,
                    searchFilters.limit,
                    searchFilters.lang
                );
            } else {
                if (searchFilters.filterType === "categoryWise") {
                    // categoryID is provided
                    if (!searchFilters.categoryId) {
                        stock = await this.stockRepo.getGroupByCategory()
                    } else {
                        stock = await this.stockRepo.getCategoryWiseStock(searchFilters.categoryId)
                    }
                } else if (searchFilters.filterType === "nameOfWeekWise") {
                    stock = await this.stockRepo.getItemDaysNameWise()
                } else {
                    stock = await this.stockRepo.getAllStock(skip, searchFilters.limit);
                }
            }
            response = super.prepareResponse(stock);
            if (stock.length !== 0) {
                response.pagination = {
                    currentPage: searchFilters.page,
                    totalPages: Math.ceil(totalCount / searchFilters.limit),
                    totalCount: totalCount,
                };
            }
            return response;
        } catch (err) {
            throw {message: err.message};
        }
    };

    addCategory = async (category, lang) => {
        try {
            let insertedCategory;

            // parsing dto to category class
            const categoryModel = new Category(category);
            // Add the category to the repository
            if (category.mode === "new") {
                insertedCategory = await this.stockRepo.addCategory(categoryModel);
            } else {
                // Update the updated timestamp
                categoryModel.updated_at = Date.now();
                categoryModel.remarks = {en: "edit", fi: "muokata"};

                // Remove _id to prevent immutable field error
                const {_id, created_at, ...updateData} = categoryModel.toObject();

                insertedCategory = await this.stockRepo.updateCategory(
                    category.id,
                    updateData
                );
            }
            return super.prepareResponse(insertedCategory);
        } catch (err) {
            throw {message: err.message};
        }
    };

    getAllCategory = async () => {
        try {
            const responseResults = await this.stockRepo.getAllCategory();
            return super.prepareResponse(responseResults);
        } catch (err) {
            throw {message: err.message};
        }
    };

    getSkipNumber = (page, limit) => {
        return (page - 1) * limit;
    };
}

module.exports = {
    StockService,
};
