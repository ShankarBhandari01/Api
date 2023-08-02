const express = require("express");
const cors = require('cors');
const user = require('./route/user');
const audit = require('express-requests-logger');
const { requestLogger, responseLogger } = require('./utlities/requestResponselogger');


//reference .config file 
require('dotenv').config();

//reference of Stock Route
const Stock = require("./route/stockroute");
const { logger } = require("./utlities/logger");



// database connection 
// require('./database/db');
var app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Use the custom logger
if (process.env.NODE_ENV === 'development') {
    app.use(requestLogger);
    app.use(responseLogger);
    //audit middleware
    // app.use(audit())
}


//binding of route 
app.use(Stock)
app.use(user);



const port = process.env.PORT || 90;
app.listen(port, () => {
    if (process.env.NODE_ENV === 'development') {
        logger.info(`Server is running on port number ${port}`)
    }
})





