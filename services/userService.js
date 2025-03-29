const bcrypt = require("bcrypt");
const lodash = require("lodash");
const BaseService = require("./BaseService");
const imageModel = require("../model/Image");

class UserService extends BaseService {
  constructor(userRepo) {
    super();
    this.userRepo = userRepo;
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

      const newImage = new imageModel();
      if (image && image.length > 0) {
        const imageData = image[0];

        // Assign properties correctly
        newImage.url = imageData.url;
        newImage.filename = imageData.originalname;
        newImage.contentType = imageData.mimetype;
        newImage.imageData = imageData.buffer;
      }
      // Attempt to add user using userRepo
      const addUserResponse = await this.userRepo.addUser(userModel, newImage);
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
        if (user.role === "user") {
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
        //save token in database
        const token = await super.assignToken(user, session);
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
