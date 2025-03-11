const mongoose = require("mongoose");
const Logger = require("../utils/logger");
const DatabaseError = require("../utils/errors");
const logger = new Logger();

class UserRepository {
  constructor(userModel) {
    this.userModel = userModel;
  }
  addUser = async (user) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const newUser = await this.userModel.create([user], { session });
      await session.commitTransaction();
      return newUser[0];
    } catch (error) {
      await session.abortTransaction();
      logger.log(`Error adding user: ${error.message}`, "error");
      throw new DatabaseError(
        "Error adding user to the database : " + error.message
      );
    } finally {
      session.endSession();
    }
  };

  getUserByUsername = async (email) => {
    try {
      return await this.userModel.findOne({ email: email });
    } catch (error) {
      logger.error("Error retrieving user by email:", error);
      throw new DatabaseError("Error retrieving user from the database");
    }
  };
}
module.exports = {
  UserRepository,
};
