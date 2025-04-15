const bcrypt = require("bcrypt");
const lodash = require("lodash");
const BaseService = require("./BaseService");
const { UserRepository } = require("../repositories/UserRepository");
const CompanyRepository = require("../repositories/CompanyRepository");

class UserService extends BaseService {
  constructor(connection) {
    super(connection);
    this.userRepo = new UserRepository(connection);
    this.companyRepository = new CompanyRepository(connection);
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
      // check user role
      if (!userModel.role) {
        throw new Error("User role is required.");
      }
      // check if user role is valid
      const roleExists = await this.companyRepository.findRoleById(
        userModel.role
      );
      if (!roleExists) {
        throw new Error("Invalid role. Role does not exist.");
      }
      // Attempt to add user using userRepo
      const addUserResponse = await this.userRepo.addUser(userModel, image);
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
        const isPasswordMatch = await bcrypt.compare(
          request.password,
          user.password
        );

        if (!isPasswordMatch) {
          // Password does not match
          throw new Error("InvalidCredentials");
        }
        // check user role
        const roleWithMenus = await this.companyRepository.findRoleById(
          user.role
        );
        if (!roleWithMenus) {
          throw new Error("Invalid role. Role does not exist.");
        }

        //Remove sensitive fields
        const sanitizedUser = lodash.omit(user, [
          "password",
          "createdDate",
        ]);

        // Add role and menuRights
        sanitizedUser.role = {
          name: roleWithMenus.name,
          description: roleWithMenus.description,
          menuRights: roleWithMenus.menuRights
            .filter((mr) => mr.menu !== null)
            .map((mr) => ({
              menu: mr.menu,
              permissions: mr.permissions,
            })),
        };

        session.user = sanitizedUser; // save user
        // firebase token
        const firebaseToken = {
          fcmToken: request.fcmToken,
          deviceInfo: request.deviceInfo,
        };
        session.firebaseToken = firebaseToken; // save forebase token

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
