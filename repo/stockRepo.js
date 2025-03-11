class StockRepository {
  constructor(stockModel) {
    this.stockModel = stockModel;
  }

  addStock = (stock) => {
    return this.stockModel.create(stock);
  };

  getAllStock = async () => {
    return await this.stockModel.find();
  };
}
module.exports = {
  StockRepository,
};
