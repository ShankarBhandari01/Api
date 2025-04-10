const mongoose = require("mongoose");
const Logger = require("../utils/logger");
const { DatabaseError } = require("../utils/errors");
const logger = new Logger();
const BaseRepo = require("./BaseRepository");
const userTable = require("../models/UserModel");
const imageModel = require("../models/Image");

class UserRepository extends BaseRepo {
  constructor(connection) {
    super();
    this.connection = connection;
    // model registered in connection
    this.userModel = userTable(connection);
    this.imageModel = imageModel(connection);
  }

  addUser = async (user, image) => {
    const session = await this.connection.startSession();
    session.startTransaction();
    let attempts = 0;
    // Retry 3 times
    while (attempts < 3) {
      try {
        const newImage = this.imageModel();
        if (image && image.length > 0) {
          const imageData = image[0];
          // Assign properties correctly
          newImage.url = imageData.url;
          newImage.filename = imageData.originalname;
          newImage.contentType = imageData.mimetype;
          newImage.imageData = imageData.buffer;
          // Upload the image first
          const uploadedImage = await this.uploadImage(newImage, session);
          // Reference the uploaded image's ID in the user models
          user.profilePic = uploadedImage.id;
        }
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
        .populate("profilePic")
        .lean();

      if (user == null) {
        return null; // Return null if user is not found
      }

      if (user.profilePic instanceof mongoose.Model) {
        // Convert Binary to Base64
        user.profileBase64 = `data:${
          user.profilePic.contentType
        };base64,${user.profilePic.imageData.toString("base64")}`;
      }
      //return the user object
      return user;
    } catch (error) {
      logger.log(`Error retrieving user by email: ${error.message}`, "error");
      throw new DatabaseError(
        `Error retrieving user from the database: ${error.message}`
      );
    }
  };
}

module.exports = {
  UserRepository,
};
