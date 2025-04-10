const bcrypt = require("bcrypt");
const lodash = require("lodash");
const BaseService = require("./BaseService");
const imageModel = require("../models/Image");
const { UserRepository } = require("../repositories/UserRepository");

class UserService extends BaseService {
  constructor(connection) {
    super(connection);
    this.userRepo = new UserRepository(connection);
  }

  doSignUp = async (userModel, image) => {
    try {
      // check if email address is already used
      var email = await this.getUser(userModel);
      if (email) {
        throw new Error("Email address already used. ");
      }
      // Hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(userModel.password, 10);
      userModel.password = hashedPassword;

      // Attempt to add user using userRepo
      const addUserResponse = await this.userRepo.addUser(userModel,image);
      // Handle addUserResponse based on result
      if (!addUserResponse) {
        throw new Error("Failed to add user");
      }

      const sanitizedResponse = lodash.omit(addUserResponse.toObject(), [
        "password",
        "createdDate",
      ]);
      // Prepare success response
      const response = { data: sanitizedResponse };
      return response;
    } catch (err) {
      // Handle errors
      throw { message: err.message };
    }
  };
  // admin login only for now
  doLogin = async (request, session) => {
    try {
      var user = await this.getUser(request);
      if (user === null) {
        throw new Error("UserNotFound");
      } else {
        if (user.role === "user" || user.role === undefined) {
          throw new Error("Permission Denied");
        }
        const isPasswordMatch = await bcrypt.compare(
          request.password,
          user.password
        );

        if (!isPasswordMatch) {
          // Password does not match
          throw new Error("InvalidCredentials");
        }
        lodash.omit(user.password); //remove password
        // firebase token
        const firebaseToken = {
          fcmToken: request.fcmToken,
          deviceInfo: request.deviceInfo,
        };
        session.firebaseToken = firebaseToken; // save forebase token
        session.user = user; // save user

        //save token in database
        const token = await super.assignToken(session);
        // return session with token
        return { session: token, user: session.user };
      }
    } catch (err) {
      throw { message: err.message }; // Propagate the error to the controller
    }
  };
  // get user details
  getUser = async (request) =>
    await this.userRepo.getUserByUsername(request.email);

  logout = async (userId) => {
    try {
      return await super.logout(userId);
    } catch (err) {
      throw { message: err.message };
    }
  };
}

module.exports = {
  UserService,
};
