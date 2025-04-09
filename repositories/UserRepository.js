const mongoose = require("mongoose");
const Logger = require("../utils/logger");
const { DatabaseError } = require("../utils/errors");
const logger = new Logger();
const BaseRepo = require("./BaseRepository");

class UserRepository extends BaseRepo {
  constructor(userModel) {
    super();
    this.userModel = userModel;
  }

  addUser = async (user, image) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    let attempts = 0;
    // Retry 3 times
    while (attempts < 3) {
      try {
        // Upload the image first
        const uploadedImage =this.uploadImage(image, session);
        // Reference the uploaded image's ID in the user models
        user.profilePic = uploadedImage.id;
        // Insert user data with the image reference
        const newUser = await this.userModel.create([user], { session });
        // Commit the transaction
        await session.commitTransaction();
        // Return the newly created user
        return newUser[0];
      } catch (error) {
        await session.abortTransaction();
        attempts++;
        if (attempts >= 3) {
          logger.log(
            `Failed after multiple attempts: ${error.message}`,
            "error"
          );
        }
        logger.log(`Error adding user: ${error.message}`, "error");
        throw new DatabaseError(
          "Error adding user to the database : " + error.message
        );
      } finally {
        await session.endSession();
      }
    }
  };
  getUserByUsername = async (email) => {
    try {
      const user = await this.userModel
        .findOne({ email: email })
        .populate("profilePic").lean();

      if (user == null) {
        return null; // Return null if user is not found
      }

      if (user.profilePic) {
        // Convert Binary to Base64
        user.profileBase64 = `data:${
          user.profilePic.contentType
        };base64,${user.profilePic.imageData.toString("base64")}`;
      }
      //return the user object
      return user;
    } catch (error) {
      logger.log(`Error retrieving user by email: ${error.message}`, "error");
      throw new DatabaseError("Error retrieving user from the database");
    }
  };
}

module.exports = {
  UserRepository,
};
