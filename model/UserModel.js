const mongoose = require('mongoose')
const { Schema, model } = mongoose;
//creating the user scheme 
const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});

// the model of the user scheme 
const User = model('User', userSchema);
module.exports = User;