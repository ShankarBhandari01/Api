
class StockDTO {
  constructor(stock, stockImage) {
    this.id = stock.id;
    this.image = stockImage || stock.image;
    this.stockName = this.parseLangField(stock.stockName);
    this.description = this.parseLangField(stock.description);
    this.remarks = this.parseLangField(stock.remarks);
    this.quantity = stock.quantity || 0;
    this.amount = stock.amount || 0;
    this.createdDate = stock.createdDate;
    this.updatedDate = stock.updated_ts || stock.createdDate;
    this.mode = stock.mode || "new";
    this.categoryID=stock.categoryID
  }

  // stringified JSON fields
  parseLangField(field) {
    if (typeof field === "string") {
      try {
        field = JSON.parse(field);
      } catch (e) {
        field = {};
      }
    }
    return field;
  }
}
module.exports = StockDTO;
