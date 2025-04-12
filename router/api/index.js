const router = require("express").Router();
//binding of route
router.use(require("./stockroute"));
router.use(require("./UserRoute"));
router.use(require("../api/videoStramingRout"));
router.use(require("./CompanyRoute"));
router.use(require("./ReservationRoute"));
router.use(require("./SubscriberRoute"));
router.use(require("./OrderRoute"));

module.exports = router;
