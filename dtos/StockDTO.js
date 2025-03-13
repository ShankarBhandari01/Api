// dtos/StockDTO.js

class StockDTO {
  constructor(stock, stockImage) {
    this.id = stock.id;
    this.image = stockImage;
    this.stockName = stock.stockName;
    this.quantity = stock.quantity || 0;
    this.amount = stock.amount;
    this.mode = stock.mode || "new";
    this.description = stock.description;
    this.createdDate = stock.createdDate;
    this.updatedDate = stock.updatedDate || stock.createdDate;
  }
}

module.exports = StockDTO;
