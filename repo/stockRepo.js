const BaseRepo = require("./BaseRepo");
const { UpdateError } = require("../utils/errors");
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
}
module.exports = {
  StockRepository,
};
