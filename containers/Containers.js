import { createContainer, asClass } from "awilix";
import MongoConnectionManager from "../database/ConnectionManager.js";
import EmailMarketingJobManager from "../jobs/EmailMarketingJobManager.js";

import registerRepositories from "./registerRepositories.js";
import registerServices from "./registerServices.js";
import registerControllers from "./registerControllers.js";

const container = createContainer();

// Global singleton
container.register({
  mongoConnectionManager: asClass(MongoConnectionManager).singleton(),
  emailMarketingJobManager: asClass(EmailMarketingJobManager).singleton(),
});

// Modular per-request scoped registrations
registerRepositories(container);
registerServices(container);
registerControllers(container);

export default container;
