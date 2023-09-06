class StockRepository {
    constructor(stockModel) {
        this.stockModel = stockModel;
    }

    addStock =(stock)=>{
        return this.stockModel.create(stock);
    }

}
module.exports = {
    StockRepository,
};