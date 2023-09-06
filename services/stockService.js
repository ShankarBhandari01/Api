

/**
     * Constructor for StockService
     * @param {StockRepository} stockRepo - An instance of the StockRepository class.
     */

class StockService {
    constructor(stockRepo) {
        this.stockRepo = stockRepo;
    }

    addStock = async (stockModel) => {
        const response = {};
        const insertedStock = await this.stockRepo.addStock(stockModel);
        if (!insertedStock) {
            response.message = customResourceResponse.serverError.message;
            response.statusCode = customResourceResponse.serverError.statusCode;
            return response;
        }

        response.message = customResourceResponse.reqCreated.message;
        response.statusCode = customResourceResponse.reqCreated.statusCode;
        response.data = insertedStock;
        return response;
    }

}

module.exports = {
    StockService,
};