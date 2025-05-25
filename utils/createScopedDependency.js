import { asValue } from "awilix";

export default async function createScopedDependency(
  container,
  dbName,
  dependencyName
) {
  const { logger, mongoConnectionManager } = container.cradle;

  if (!mongoConnectionManager) {
    logger.log("mongoConnectionManager not registered in container", "error");
    return { error: "mongoConnectionManager not registered in container" };
  }

  try {
    const connection = await mongoConnectionManager.getConnection(dbName);

    if (!connection) {
      const msg = `No MongoDB connection found for db: ${dbName}`;
      logger.log(msg, "error");
      return { error: msg };
    }

    const scope = container.createScope();
    scope.register({
      connection: asValue(connection),
    });

    const dependency = scope.resolve(dependencyName);

    return { scope, dependency };
  } catch (err) {
    const msg = `Failed to create scoped dependency '${dependencyName}': ${err.message}`;
    logger.log(msg, "error");
    return { error: msg };
  }
}
