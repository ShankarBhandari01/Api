import { createContainer, asClass } from "awilix";
import MongoConnectionManager from "../database/ConnectionManager.js";
import EmailMarketingJobManager from "../jobs/EmailMarketingJobManager.js";

import registerRepositories from "./registerRepositories.js";
import registerServices from "./registerServices.js";
import registerControllers from "./registerControllers.js";
import RedisSocketService from "../socketio/RedisSocketService.js";
import Logger from "../utils/logger.js";
import AgendaService from "../services/AgendaService.js";

const container = createContainer();

// Global singleton
container.register({
  logger: asClass(Logger).singleton(),
  mongoConnectionManager: asClass(MongoConnectionManager).singleton(),
  emailMarketingJobManager: asClass(EmailMarketingJobManager).singleton(),
  agendaService: asClass(AgendaService).singleton(),
  redisSocketService: asClass(RedisSocketService).singleton(),
});

// Modular per-request scoped registrations
registerRepositories(container);
registerServices(container);
registerControllers(container);

export default container;
