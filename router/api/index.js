import { Router } from "express";
import stockRoute from "./stockroute.js";
import userRoute from "./UserRoute.js";
import videoStreamingRoute from "../api/videoStramingRout.js";
import companyRoute from "./CompanyRoute.js";
import reservationRoute from "./ReservationRoute.js";
import subscriberRoute from "./SubscriberRoute.js";
import orderRoute from "./OrderRoute.js";
import menuRoute from "./MenuRoute.js";
import apiHealthRoute from "./apihealtRoute.js";
import predictionRoute from "./prediction.routes.js";
import admin from "./admin.js";

const router = Router();
// binding of route
router.use(stockRoute);
router.use(userRoute);
router.use(videoStreamingRoute);
router.use(companyRoute);
router.use(reservationRoute);
router.use(subscriberRoute);
router.use(orderRoute);
router.use(menuRoute);
router.use(apiHealthRoute);
router.use(predictionRoute);
router.use(admin);

export default router;
