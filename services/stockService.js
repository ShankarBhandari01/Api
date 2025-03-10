/**
     * Constructor for StockService
     * @param {StockRepository} stockRepo - An instance of the StockRepository class.
     */

const reesponse =  require("../utils/constants");

class StockService {
    constructor(stockRepo) {
        this.stockRepo = stockRepo;
    }

    addStock = async (stockModel,files) => {
        const response = {};

        if (files) {
            stockModel.image = files.image[0].path; // Store profile picture file path
        }
        const insertedStock = await this.stockRepo.addStock(stockModel);

        if (!insertedStock) {
            response.message = reesponse.customResourceResponse.serverError.message;
            response.statusCode = reesponse.customResourceResponse.serverError.statusCode;
            return response;
        }

        response.message = reesponse.customResourceResponse.success.message;
        response.statusCode = reesponse.customResourceResponse.success.statusCode;
        response.data = insertedStock;
        return response;
    }

}

module.exports = {
    StockService,
};