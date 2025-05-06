import RequestHandler from "../utils/RequestHandler.js";
class BaseController extends RequestHandler {
  constructor(req, res, { mongoConnectionManager }) {
    super();
    this.req = req;
    this.res = res;
    this.lang = req.session.lang || "en";
    this.mongoConnectionManager = mongoConnectionManager;
  }

  sendResponse = (response, message) => {
    return super.sendSuccess(this.res, message)(response);
  };
  sendError = (message) => {
    return super.sendError(this.req, this.res, message);
  };

  async getDbConnection() {
    const dbName = this.req?.session?.envConfig?.database;
    if (!dbName) throw new Error("Database name not found in session");
    const connection = await this.mongoConnectionManager.getConnection(dbName);
    return connection;
  }

  /**
   * Generic executor for *any* service method
   * @param {Function} ServiceClass - pass the service class (e.g. CompanyService)
   * @param {Function} RepositoryClass - pass the objects of Repositories class with key value (e.g. {MenuRepository: MenuRepository})
   * @param {Function} actionFn - function that receives the service instance and returns a Promise
   * @param {String} successMessage - success response message
   * @param {Boolean} sendResult - send response
   */
  async runServiceMethod(
    ServiceClass,
    Repositories,
    actionFn,
    successMessage = "Success",
    sendResult = true
  ) {
    try {
      const connection = await this.getDbConnection();
      // Instantiate all repositories from the map
      const repositoryInstances = {};
      for (const [key, RepoClass] of Object.entries(Repositories)) {
        repositoryInstances[key] = new RepoClass(connection);
      }
      // Pass the repository object to the service
      const service = new ServiceClass(connection, repositoryInstances);
      const result = await actionFn(service, repositoryInstances, connection);

      if (sendResult) {
        this.sendResponse(result, successMessage);
      }
    } catch (err) {
      this.log(
        `[${this.constructor.name}] ${actionFn.name} error: ${err}`,
        "error"
      );
      this.sendError(err);
    }
  }
}

export default BaseController;
