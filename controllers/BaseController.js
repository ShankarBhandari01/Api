const Logger = require("../utils/logger");
const RequestHandler = require("../utils/RequestHandler");

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class BaseController {
    constructor(req, res) {
        this.req = req;
        this.res = res;
        this.lang = req.session.lang || "en";
    }

    sendResponse = (response, message) => {
        return requestHandler.sendSuccess(this.res, message)(response);
    }
    sendError = (message) => {
        return requestHandler.sendError(this.req, this.res, message);
    }
}

module.exports = BaseController;