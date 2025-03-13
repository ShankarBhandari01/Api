/**
 * Constructor for StockService
 * @param {StockRepository} stockRepo - An instance of the StockRepository class.
 */

const resources = require("../utils/constants");
const stock = require("../model/Stocks"); // import of stock model
class StockService {
  constructor(stockRepo) {
    this.stockRepo = stockRepo;
  }

  addStock = async (StockDto) => {
    try {
      const response = {};
      //initalise
      let insertedStock;
      const stockModel = new stock(StockDto);

      // Handle image upload
      if (StockDto.image && StockDto.image.image?.[0]?.path) {
        stockModel.image = StockDto.image.image[0].path;
      }
      // check the mode of the transcation
      if (StockDto.mode == "new") {
        insertedStock = await this.stockRepo.addStock(stockModel);
      } else {
        // Update the updated timestamp
        stockModel.updated_ts = Date.now();
        stockModel.remarks = { en: "edit", fi: "muokata" };
        // Remove _id to prevent immutable field error
        const { _id, createdDate, ...updateData } = stockModel.toObject();

        insertedStock = await this.stockRepo.updateStock(
          StockDto.id,
          updateData
        );
      }

      if (!insertedStock) {
        response.message = resources.customResourceResponse.serverError.message;
        response.statusCode =
          resources.customResourceResponse.serverError.statusCode;
        return response;
      }

      response.message = resources.customResourceResponse.success.message;
      response.statusCode = resources.customResourceResponse.success.statusCode;
      response.data = insertedStock;
      return response;
    } catch (err) {
      throw { message: err.message };
    }
  };

  getAllStock = async (page = 1, limit = 10) => {
    const response = {};

    try {
      // Get the total count of stock items for pagination info
      const totalCount = await this.stockRepo.getStockCount();
      // Calculate the skip value for pagination
      var skip = (page - 1) * limit;
      // set skip to 0 if less than 20
      if (totalCount < 20) {
        skip = 0;
      }
      // Fetch stock items from the repository with pagination
      const stock = await this.stockRepo.getAllStock(skip, limit);

      // If no stock is found, return a "not found" response
      if (!stock || stock.length === 0) {
        response.message =
          resources.customResourceResponse.recordNotFound.message;
        response.statusCode =
          resources.customResourceResponse.recordNotFound.statusCode;
        return response;
      }

      // Create the pagination information
      const pagination = {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount: totalCount,
      };

      response.message = resources.customResourceResponse.success.message;
      response.statusCode = resources.customResourceResponse.success.statusCode;
      response.data = stock;
      response.pagination = pagination;
      return response;
    } catch (err) {
      throw { message: err.message };
    }
  };
}

module.exports = {
  StockService,
};
