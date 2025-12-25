import {
  createContainer,
  asClass,
  asValue,
  Lifetime,
  asFunction,
} from "awilix";
import MongoConnectionManager from "../database/ConnectionManager.js";
import EmailMarketingJobManager from "../jobs/EmailMarketingJobManager.js";
import registerRepositories from "./registerRepositories.js";
import registerServices from "./registerServices.js";
import registerControllers from "./registerControllers.js";
import SocketService from "../socketio/RedisSocketService.js";
import Logger from "../utils/logger.js";
import AgendaService from "../services/AgendaService.js";
import MLServiceClient from "../utils/MLServiceClient.js";
import PredictionService from "../services/prediction.service.js";
import NotificationQueueService from "../jobs/NotificationQueueService.js";
import createLanguageMiddleware from "../middleware/languageMiddleware.js";
import RedisClientManager from "../redis/RedisClientManager.js";
import dynamicCors from "../middleware/CorsMiddleware.js";
import RabbitMQ from "../utils/RabbitMQ.js";

const container = createContainer();

// asValue is used for values that are not classes
container.register({
  redisUrl: asValue(
    process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development"
      ? "redis://localhost:6380"
      : process.env.REDIS_URL || "redis://localhost:6379"
  ),
  grpcAddress: asValue("localhost:50051"),
});


// Global singleton
container.register({
  languageMiddleware: asFunction(createLanguageMiddleware).singleton(),
  logger: asClass(Logger).singleton(),
  mongoConnectionManager: asClass(MongoConnectionManager).singleton(),
  emailMarketingJobManager: asClass(EmailMarketingJobManager).singleton(),
  agendaService: asClass(AgendaService).singleton(),
  redisSocketService: asClass(SocketService).singleton(),
  mlClient: asClass(MLServiceClient, { lifetime: Lifetime.SINGLETON }),
  predictionService: asClass(PredictionService).singleton(),
  notificationQueueService: asClass(NotificationQueueService).singleton(),
  redisClientManager: asClass(RedisClientManager).singleton(),
  corsMiddleware: asFunction(dynamicCors).singleton(),
  rabbitMQ: asClass(RabbitMQ)
    .singleton()
    .inject(() => ({ url: process.env.RABBITMQ_URL || 'amqp://localhost' })),
});

// Modular per-request scoped registrations
registerRepositories(container);
registerServices(container);
registerControllers(container);

export default container;
