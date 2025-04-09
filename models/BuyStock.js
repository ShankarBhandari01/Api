const { Schema, model } = require('mongoose')
//creating the BuyStock scheme 
const buyStockScheme = new Schema({
    userID: {
        type: String,
        required: true
    },
    stockName: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    Unit: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    type: {
        type: String,
        require: true
    },
    total: {
        type: Number,
        require: true
    }
})
// the models of the Stock scheme
module.exports = model('BuyStock', buyStockScheme);
