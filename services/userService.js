import { hash, compare } from "bcryptjs";
import pkg from "lodash";
const { omit } = pkg;
import BaseService from "./BaseService.js";

class UserService extends BaseService {
  constructor({ connection, userRepository, companyRepository }) {
    super(connection);
    this.userRepo = userRepository;
    this.companyRepository = companyRepository;
  }

  // New helper method to check for duplicate email and role existence
  async validateUser(userModel, userId = null) {
    // Check if email address is already used
    const existingUser = await this.getUser(userModel);
    if (existingUser && existingUser._id !== userId) {
      throw new Error("Email address already used.");
    }

    // Check user role
    if (!userModel.role) {
      throw new Error("User role is required.");
    }

    // Check if user role is valid
    const roleExists = await this.companyRepository.findRoleById(
      userModel.role
    );
    if (!roleExists) {
      throw new Error("Invalid role. Role does not exist.");
    }
  }

  doSignUp = async (userModel, image) => {
    try {
      // Validate email and role
      await this.validateUser(userModel);

      // Hash the password using bcrypt
      const hashedPassword = await hash(userModel.password, 10);
      userModel.password = hashedPassword;

      const addUserResponse = await this.userRepo.addUser(userModel, image);
      if (!addUserResponse) {
        throw new Error("Failed to add user");
      }

      // Remove sensitive data from the response
      const sanitizedResponse = omit(addUserResponse.toObject(), [
        "password",
        "createdDate",
      ]);
      return { data: sanitizedResponse };
    } catch (err) {
      throw { message: err.message };
    }
  };

  doLogin = async (request, session) => {
    try {
      const user = await this.getUser(request);
      if (!user) throw new Error("UserNotFound");

      // Check if user is active
      if (!user.isActive) throw new Error("User is not active");

      // Check if password is correct
      const isPasswordMatch = await compare(request.password, user.password);
      if (!isPasswordMatch) throw new Error("InvalidCredentials");

      // Check user role
      const roleWithMenus = await this.getUserRole(user.role);
      if (!roleWithMenus) throw new Error("Invalid role. Role does not exist.");

      // Sanitize user data
      const sanitizedUser = omit(user, ["password", "createdDate"]);

      // Add role and menu rights
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

      session.user = sanitizedUser;
      session.firebaseToken = {
        fcmToken: request.fcmToken,
        deviceInfo: request.deviceInfo,
      };

      // Save token and return session data
      const token = await super.assignToken(session);
      return { session: token, user: session.user };
    } catch (err) {
      throw { message: err.message };
    }
  };

  // Helper methods
  getUserRole = async (roleId) =>
    await this.companyRepository.findRoleById(roleId);
  getUser = async (request) =>
    await this.userRepo.getUserByUsername(request.email);
  getUserById = async (id) => await this.userRepo.getUserById(id);

  logout = async (userId) => {
    try {
      return await super.logout(userId);
    } catch (err) {
      throw { message: err.message };
    }
  };

  updateUser = async (userModel, image, userId) => {
    try {
      // Validate email and role
      await this.validateUser(userModel, userId);

      // Attempt to update user using userRepo
      const updateUserResponse = await this.userRepo.updateUser(
        userModel,
        image,
        userId
      );
      if (!updateUserResponse) {
        throw new Error("Failed to update user");
      }

      const sanitizedResponse = omit(updateUserResponse.toObject(), [
        "password",
        "createdDate",
        "updatedDate",
        "__v",
      ]);
      return super.prepareResponse(sanitizedResponse);
    } catch (err) {
      throw { message: err.message };
    }
  };

  getAllUsers = async () => {
    try {
      const users = await this.userRepo.getAllUsers();
      return super.prepareResponse(users);
    } catch (err) {
      throw { message: err.message };
    }
  };
}

export default UserService;
