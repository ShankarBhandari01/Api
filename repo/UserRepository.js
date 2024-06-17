const mongoose = require("mongoose");
const logger = require("../utils/logger"); // Import a logger module
const DatabaseError = require("../utils/errors");

class UserRepository {
  constructor(userModel) {
    this.userModel = userModel;
  }
  async addUser(user) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const newUser = await this.userModel.create([user], { session });
      await session.commitTransaction();
      return newUser[0];
    } catch (error) {
      await session.abortTransaction();
      logger.error("Error adding user:", error);
      throw new DatabaseError("Error adding user to the database");
    } finally {
      session.endSession();
    }
  }

  async getUserByUsername(email) {
    try {
      return await this.userModel.findOne({ email: email });
    } catch (error) {
      logger.error("Error retrieving user by email:", error);
      throw new DatabaseError("Error retrieving user from the database");
    }
  }
}
module.exports = {
  UserRepository,
};
