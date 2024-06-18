const userlog = require("../model/UserloginLog");
const RequestHandler = require("../utils/RequestHandler");
const Logger = require("../utils/logger");

class BaseRepo {
  insertUserlog = async (log) => {
    return await userlog.create(log);
  };

  updateLogMsg = async (msg,id) => {
    // Define the filter query to find the document to update
    const filter = { _id: id };

    // Define the update operation
    const update = {
      $set: {
        statusMsg: msg,
      },
    };

    // Update the document
    return await userlog.updateOne(filter, update);
  };
}
module.exports = BaseRepo;
