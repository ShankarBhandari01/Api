const express = require("express");
const cors = require('cors');
const user = require('./route/user');
const audit= require( 'express-requests-logger');

//reference .config file 
require('dotenv').config();

//reference of Stock Route
const Stock = require("./route/stockroute");

// database connection 
require('./database/db');
var app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


//binding of route 
app.use(Stock)
app.use(user);

app.use(audit())

const port = process.env.PORT || 90;
app.listen(port, () => {
    console.log(`Server is running on port number ${port}`)
})





