import { createContainer, asClass, asValue, asFunction } from "awilix";
import SubscriberController from "../controllers/SubscriberController.js";
import MongoConnectionManager from "../database/ConnectionManager.js";
import SubscriberService from "../services/SubscriberService.js";
import SubscriberRepository from "../repositories/SubscriberRepository.js";

const container = createContainer();

// Register services, repositories, and controllers
container.register({
  subscriberController: asClass(SubscriberController).singleton(),
  subscriberRepository: asClass(SubscriberRepository).singleton(),
  subscriberService: asClass(SubscriberService).singleton(), // No inject here, dependencies go in constructor
});

// Register the MongoDB connection manager
container.register({
  mongoConnectionManager: asClass(MongoConnectionManager).singleton(),
});

export default container;
