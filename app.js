const express = require("express");
const cors = require('cors');
const user = require('./route/user');
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

const port = process.env.PORT || 90;
app.listen(port, () => {
    console.log(`Server is running on port number ${port}`)
})

