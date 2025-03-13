/**
 * Constructor for StockService
 * @param {StockRepository} stockRepo - An instance of the StockRepository class.
 */

const reesponse = require("../utils/constants");
const stock = require("../model/Stocks"); // import of stock model
class StockService {
  constructor(stockRepo) {
    this.stockRepo = stockRepo;
  }

  addStock = async (StockDto) => {
    try {
      const response = {};
      //initalise the class
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
        stockModel.remarks = "edited";
        // Remove _id to prevent immutable field error
        const { _id, createdDate, ...updateData } = stockModel.toObject();

        insertedStock = await this.stockRepo.updateStock(
          StockDto.id,
          updateData
        );
      }
      
      if (!insertedStock) {
        response.message = reesponse.customResourceResponse.serverError.message;
        response.statusCode =
          reesponse.customResourceResponse.serverError.statusCode;
        return response;
      }

      response.message = reesponse.customResourceResponse.success.message;
      response.statusCode = reesponse.customResourceResponse.success.statusCode;
      response.data = insertedStock;
      return response;
    } catch (err) {
      throw { message: err.message };
    }
  };

  getAllStock = async () => {
    const response = {};
    const stock = await this.stockRepo.getAllStock();
    if (!stock) {
      response.message =
        reesponse.customResourceResponse.recordNotFound.message;
      response.statusCode =
        reesponse.customResourceResponse.recordNotFound.statusCode;
      return response;
    }
    response.message = reesponse.customResourceResponse.success.message;
    response.statusCode = reesponse.customResourceResponse.success.statusCode;
    response.data = stock;
    return response;
  };
}

module.exports = {
  StockService,
};
