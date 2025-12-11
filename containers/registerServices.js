import { asClass } from "awilix";
import BaseService from "../services/BaseService.js";
import CompanyService from "../services/CompanyService.js";
import EmailService from "../services/EmailService.js";
import FirebasePushNotificationService from "../services/FirebasePushNotificationService.js";
import MenuService from "../services/MenuService.js";
import OrderService from "../services/OrderService.js";
import ReservationService from "../services/ReservationService.js";
import StockService from "../services/stockService.js";
import SubscriberService from "../services/SubscriberService.js";
import UserService from "../services/userService.js";
import SettingService from "../services/SettingService.js";
import AdminService from "../services/AdminService.js";
import ReportingService from "../services/reportingService.js";

export default function registerServices(container) {
  container.register({
    settingService: asClass(SettingService).scoped(),
    subscriberService: asClass(SubscriberService).scoped(),
    userService: asClass(UserService).scoped(),
    companyService: asClass(CompanyService).scoped(),
    baseService: asClass(BaseService).scoped(),
    menuService: asClass(MenuService).scoped(),
    orderService: asClass(OrderService).scoped(),
    reservationService: asClass(ReservationService).scoped(),
    stockService: asClass(StockService).scoped(),
    emailService: asClass(EmailService).scoped(),
    firebasePushNotificationService: asClass(
      FirebasePushNotificationService
    ).scoped(),
    adminService: asClass(AdminService).scoped(),
    reportingService: asClass(ReportingService).scoped()
  });
}
