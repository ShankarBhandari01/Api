import { asValue } from "awilix";
export function createTenantScope(container) {
  return async (req, res, next) => {
    try {
      const dbName = req.session?.envConfig?.database;
      // Access the singleton connection manager from the container
      const mongoConnectionManager = container.resolve(
        "mongoConnectionManager"
      );

      // Get the tenant-specific database connection
      const connection = await mongoConnectionManager.getConnection(dbName);

      // Create a new scoped container per request
      const scope = container.createScope();
      scope.register({
        connection: asValue(connection),
        req: asValue(req),
        res: asValue(res),
      });

      // Attach the scoped container to the request
      req.scope = scope;
      next();
    } catch (err) {
      console.error("Error in createTenantScope:", err);
      // Send an error response if something goes wrong
      res.status(500).json({
        success: false,
        message: "Failed to initialize tenant scope.",
      });
    }
  };
}
