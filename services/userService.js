const customResourceResponse = require("../utils/constants");
const bcrypt = require("bcrypt");
const lodash = require("lodash");
const BaseService = require("./BaseService");

class UserService extends BaseService {
  constructor(userRepo) {
    super();
    this.userRepo = userRepo;
  }

  doSignUp = async (userModel) => {
    try {
      // check if email address is already used
      var email =  await this.getUser(userModel)
      if(email){
        throw new Error("Email address already used. ")
      }
      // Hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(userModel.password, 10);
      userModel.password = hashedPassword;

      // Attempt to add user using userRepo
      const addUserResponse = await this.userRepo.addUser(userModel);

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

  doLogin = async (request) => {
    try {
      var user = await this.getUser(request);
      if (user === null) {
        throw new Error("UserNotFound");
      } else {
        const isPasswordMatch = await bcrypt.compare(
          request.password,
          user.password
        );

        if (!isPasswordMatch) {
          // Password does not match
          throw new Error("InvalidCredentials");
        }

        lodash.omit(user.password); //remove password
        const token = super.assignToken(user);
        return { session: token, user: user };
      }
    } catch (err) {
      throw { message: err.message }; // Propagate the error to the controller
    }
  };
// get user details 
  getUser = async (request) => await this.userRepo.getUserByUsername(request.email);
}
module.exports = {
  UserService,
};
