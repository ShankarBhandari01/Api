const { extend } = require("lodash").extend;
class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = "DatabaseError";
    this.status = 500;
  }
}

class UpdateError extends Error {
  constructor(message) {
    super(message);
    this.name = "updateError";
    this.status = 500;
  }
}

module.exports = { DatabaseError, UpdateError };
