const BaseRepo = require("./BaseRepo");
const {UpdateError} = require("../utils/errors");
class StockRepository extends BaseRepo {
  constructor(stockModel) {
    super();
    this.stockModel = stockModel;
  }

  addStock = (stock) => {
    return this.stockModel.create(stock);
  };

  getAllStock = async () => {
    return await this.stockModel.find();
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
  
}
module.exports = {
  StockRepository,
};
