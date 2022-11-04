const mongoose = require('mongoose')
const { Schema, model } = mongoose;
//creating the BuyStock scheme 
const buyStockScheme = new Schema({
    userID:{
        type:String,
        required:true
    },
    stockName: {
        type: String,
        required: true, 
    },
    quantity: {
        type: Number,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    Unit:{
        type:Number,
        required:true
    },
    date:{
        type:String,
        required:true
    },
    type:{
        type:String,
        require:true
    },
    total:{
        type:Number,
        require:true
    }
})
// the model of the Stock scheme 
const BuyStock = model('BuyStock', buyStockScheme);
module.exports = BuyStock;