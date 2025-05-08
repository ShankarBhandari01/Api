import { asClass } from "awilix";
import BaseRepository from "../repositories/BaseRepository.js";
import CompanyRepository from "../repositories/CompanyRepository.js";
import MenuRepository from "../repositories/MenuRepository.js";
import NotificationRepository from "../repositories/NotificationRepository.js";
import OrderRespository from "../repositories/OrderRepository.js";
import ReservationRepository from "../repositories/ReservationRepository.js";
import StockRepository from "../repositories/stockRepo.js";
import SubscriberRepository from "../repositories/SubscriberRepository.js";
import UserRepository from "../repositories/UserRepository.js";

export default function registerRepositories(container) {
  container.register({
    subscriberRepository: asClass(SubscriberRepository).scoped(),
    userRepository: asClass(UserRepository).scoped(),
    companyRepository: asClass(CompanyRepository).scoped(),
    baseRepository: asClass(BaseRepository).scoped(),
    menuRepository: asClass(MenuRepository).scoped(),
    notificationRepository: asClass(NotificationRepository).scoped(),
    orderRepository: asClass(OrderRespository).scoped(),
    reservationRepository: asClass(ReservationRepository).scoped(),
    stockRepository: asClass(StockRepository).scoped(),
  });
}
