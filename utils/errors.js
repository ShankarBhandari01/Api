export class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = "DatabaseError";
    this.status = 400;
  }
}

export class UpdateError extends Error {
  constructor(message) {
    super(message);
    this.name = "updateError";
    this.status = 400;
  }
}

export default { DatabaseError, UpdateError };
