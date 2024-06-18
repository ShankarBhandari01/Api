const router = require('express').Router();
const user = require('./UserRoute');
const Stock = require('./Stockroute');
const streamingRoute = require('../api/videoStramingRout');

//binding of route 
router.use(Stock)
router.use(user);
router.use(streamingRoute);


module.exports = router;