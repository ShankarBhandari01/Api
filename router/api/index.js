const router = require("express").Router();
const user = require("./UserRoute");
const Stock = require("./stockroute");
const streamingRoute = require("../api/videoStramingRout");

//binding of route
router.use(Stock);
router.use(user);
router.use(streamingRoute);

//test url
router.get("/", (req, res) => {
  res.send("Hello, world!");
});

module.exports = router;
