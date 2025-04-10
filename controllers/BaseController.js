const RequestHandler = require("../utils/RequestHandler");
const mongoManager = require("../database/ConnectionManager");
class BaseController extends RequestHandler {
  constructor(req, res) {
    super();
    this.req = req;
    this.res = res;
    this.lang = req.session.lang || "en";
  }

  sendResponse = (response, message) => {
    return super.sendSuccess(this.res, message)(response);
  };
  sendError = (message) => {
    return super.sendError(this.req, this.res, message);
  };

  async getDbConnection() {
    const dbName = this.req?.session?.envConfig?.database; // for multi database we can change this
    if (!dbName) throw new Error("Database name not found in session");
    const connection = await mongoManager.getConnection(dbName);
    return connection;
  }

  /**
   * 🌍 Generic executor for *any* service method
   * @param {Function} ServiceClass - pass the service class (e.g. CompanyService)
   * @param {Function} actionFn - function that receives the service instance and returns a Promise
   * @param {String} successMessage - success response message
   * @param {Boolean} sendResult - send response
   */
  async runServiceMethod(
    ServiceClass,
    actionFn,
    successMessage = "Success",
    sendResult = true
  ) {
    try {
      const connection = await this.getDbConnection();
      const service = new ServiceClass(connection); // instantiate your service here
      const result = await actionFn(service);

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

module.exports = BaseController;
