const router = require("express").Router();
const user = require("./UserRoute");
const Stock = require("./stockroute");
const streamingRoute = require("../api/videoStramingRout");
const companyRoute = require("./CompanyRoute");


//binding of route
router.use(Stock);
router.use(user);
router.use(streamingRoute);
router.use(companyRoute);

module.exports = router;
