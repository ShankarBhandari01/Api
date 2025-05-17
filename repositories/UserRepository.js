import { DatabaseError } from "../utils/errors.js";
import BaseRepo from "./BaseRepository.js";
import userTable from "../models/UserModel.js";
import imageModel from "../models/Image.js";
import Menu from "../models/UiMenuRight.js";
import Role from "../models/Role.js";
import _ from "lodash";

class UserRepository extends BaseRepo {
  constructor({ connection, logger }) {
    super(connection);
    this.connection = connection;
    this.userModel = userTable(connection);
    this.imageModel = imageModel(connection);
    this.menu = Menu(connection);
    this.role = Role(connection);
    this.logger = logger;
  }

  addUser = async (user, image) => {
    let attempts = 0;

    while (attempts < 3) {
      const session = await this.connection.startSession();
      try {
        session.startTransaction();

        if (image) {
          user.profilePic = await this.handleImageUploadToDatabase(
            image,
            session
          );
        } else {
          user.profilePic = null;
        }

        const newUser = await this.userModel.create([user], { session });

        await session.commitTransaction();
        return newUser[0]; // Success
      } catch (error) {
        await session.abortTransaction();
        attempts++;
        this.logger.log(`Attempt ${attempts}: ${error.message}`, "error");

        if (attempts >= 3) {
          this.logger.log(`Failed after 3 attempts: ${error.message}`, "error");
          throw new DatabaseError(
            "Error adding user to the database: " + error.message
          );
        }
      } finally {
        await session.endSession();
      }
    }
  };

  getUserByUsername = async (email) => {
    try {
      const user = await this.userModel
        .findOne({ email })
        .populate("profilePic")
        .populate("role")
        .lean();

      if (!user) return null;

      user.profileBase64 = this.formatProfileImage(user.profilePic);
      delete user.profilePic;

      return user;
    } catch (error) {
      this.logger.log(
        `Error retrieving user by email: ${error.message}`,
        "error"
      );
      throw new DatabaseError(
        `Error retrieving user from the database: ${error.message}`
      );
    }
  };
  getUserById = async (userId) => {
    try {
      const user = await this.userModel
        .findById(userId)
        .populate("profilePic")
        .populate("role")
        .lean();

      if (!user) return null;

      const sanitized = _.omit(user, [
        "password",
        "createdDate",
        "updatedDate",
        "__v",
      ]);

      sanitized.profileBase64 = this.formatProfileImage(user.profilePic);
      delete sanitized.profilePic;

      return sanitized;
    } catch (error) {
      this.logger.log(`Error retrieving user by ID: ${error.message}`, "error");
      throw new DatabaseError(
        `Error retrieving user from the database: ${error.message}`
      );
    }
  };

  updateUser = async (userData, image, userId) => {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      userData.profilePic = this.handleImageUploadToDatabase(image, session);

      const updatedUser = await this.userModel
        .findByIdAndUpdate(userId, userData, { new: true, session })
        .populate("profilePic")
        .populate("role")
        .lean();

      await session.commitTransaction();

      if (!updatedUser) return null;

      updatedUser.profileBase64 = this.formatProfileImage(
        updatedUser.profilePic
      );
      delete updatedUser.profilePic;

      return updatedUser;
    } catch (error) {
      await session.abortTransaction();
      this.logger.log(`Error updating user: ${error.message}`, "error");
      throw new DatabaseError(
        `Error updating user in the database: ${error.message}`
      );
    } finally {
      await session.endSession();
    }
  };

  getAllUsers = async () => {
    try {
      const users = await this.userModel
        .find()
        .populate("profilePic")
        .populate("role")
        .lean();

      if (!users) return null;

      return users.map((user) => {
        const sanitized = _.omit(user, [
          "password",
          "createdDate",
          "updatedDate",
          "__v",
        ]);

        sanitized.profileBase64 = this.formatProfileImage(user.profilePic);
        delete sanitized.profilePic;

        return sanitized;
      });
    } catch (error) {
      this.logger.log(`Error retrieving all users: ${error.message}`, "error");
      throw new DatabaseError(
        `Error retrieving all users from the database: ${error.message}`
      );
    }
  };
}

export default UserRepository;
