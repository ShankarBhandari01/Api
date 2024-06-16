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
    const response = {};
    //ToDO need to do data validation here

    userModel.password = await bcrypt.hash(userModel.password, 10);
    const addUserResponse = await this.userRepo.addUser(userModel);

    if (!addUserResponse) {
      response.message = customResourceResponse.serverError.message;
      response.statusCode = customResourceResponse.serverError.statusCode;
      return response;
    }
    response.message = customResourceResponse.reqCreated.message;
    response.statusCode = customResourceResponse.reqCreated.statusCode;
    response.data = addUserResponse;
    return response;
  };

  doLogin = async (request) => {
    let response = {};
    try {
      const user = await this.userRepo.getUserByUsername(request.username);
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
        response = customResourceResponse.success;
        response.token = token;
        response.user = user;
        return response;
      }
    } catch (err) {
      if (err.message === "UserNotFound") {
        response = customResourceResponse.noUserFound;
      } else if (err.message === "InvalidCredentials") {
        response = customResourceResponse.invalidCreadintial;
      } else {
        // Handle unexpected errors
        response = { ...customResourceResponse.error, message: err.message };
      }
      throw response; // Propagate the error to the controller
    }
  };
}

module.exports = {
  UserService,
};
