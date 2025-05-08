// utils/createScopedDependency.js
import { asValue } from "awilix";
export default async function createScopedDependency(
  container,
  dbName,
  dependencyName
) {
  try {
    const mongoConnectionManager = container.resolve("mongoConnectionManager");

    if (!mongoConnectionManager) {
      throw new Error("mongoConnectionManager not registered in container");
    }

    const connection = await mongoConnectionManager.getConnection(dbName);
    if (!connection) {
      throw new Error(`No MongoDB connection found for db: ${dbName}`);
    }

    const scope = container.createScope();
    scope.register({
      connection: asValue(connection),
    });

    const dependency = scope.resolve(dependencyName);
    return { scope, dependency };
  } catch (err) {
    throw new Error(
      `Failed to create scoped dependency '${dependencyName}': ${err.message}`
    );
  }
}
