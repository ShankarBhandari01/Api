import { asClass } from "awilix";
import BaseController from "../controllers/BaseController.js";
import CompanyController from "../controllers/CompanyController.js";
import MenuController from "../controllers/MenuController.js";
import OrderController from "../controllers/OrderController.js";
import ReservationController from "../controllers/ReservationController.js";
import StockController from "../controllers/StockController.js";
import SubscriberController from "../controllers/SubscriberController.js";
import UserController from "../controllers/UserController.js";
import PredictionController from "../controllers/prediction.controller.js";

export default function registerControllers(container) {
  container.register({
    userController: asClass(UserController).scoped(),
    baseController: asClass(BaseController).scoped(),
    companyController: asClass(CompanyController).scoped(),
    menuController: asClass(MenuController).scoped(),
    orderController: asClass(OrderController).scoped(),
    reservationController: asClass(ReservationController).scoped(),
    stockController: asClass(StockController).scoped(),
    subscriberController: asClass(SubscriberController).scoped(),
    predictionController: asClass(PredictionController).scoped(),
  });
}
