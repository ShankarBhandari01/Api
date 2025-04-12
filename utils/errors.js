const { extend } = require("lodash").extend;
class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = "DatabaseError";
    this.status = 400;
  }
}

class UpdateError extends Error {
  constructor(message) {
    super(message);
    this.name = "updateError";
    this.status = 400;
  }
}

module.exports = { DatabaseError, UpdateError };
