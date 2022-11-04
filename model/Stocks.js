const mongoose = require('mongoose')
const { Schema, model } = mongoose;
//creating the Stock scheme 
const stockScheme = new Schema({
    stockName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});
// the model of the Stock scheme 
const Stock = model('Stock', stockScheme);
module.exports = Stock;
