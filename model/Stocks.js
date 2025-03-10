const { Schema, model } = require('mongoose')
//creating the Stock scheme 
const stockScheme = new Schema({
    image:{
        type:String,
        required:false
    },
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
    description:{
        type:String,
        required:true
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});
// the model of the Stock scheme 
module.exports =  model('Stock', stockScheme);
