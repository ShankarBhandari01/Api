import { hash, compare } from "bcryptjs";
import pkg from "lodash";
const { omit } = pkg;
import BaseService from "./BaseService.js";

class UserService extends BaseService {
  constructor({
    connection,
    userRepository,
    companyRepository,
    redisSocketService,
  }) {
    super(connection);
    this.userRepo = userRepository;
    this.companyRepository = companyRepository;
    this.redisSocketService = redisSocketService;
  }

  refreshToken = async (session) => {
    try {
      const response = await this.assignToken(session);
      await this.redisSocketService.delCacheKey("auth:token:*");
      return response;
    } catch (error) {
      throw { message: error.message };
    }
  };

  // New helper method to check for duplicate email and role existence
  async validateUser(userModel, userId = null, isupdate = false) {
    // lower case the email
    userModel.email = userModel.email.toLowerCase();

    // Check if email address is already used
    const existingUser = await this.getUser(userModel);
    if (existingUser && existingUser._id !== userId && !isupdate) {
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
    return existingUser;
  }

  hashedPassword = async (password) => await hash(password, 10);

  doSignUp = async (userModel, image) => {
    try {
      // Validate email and role
      await this.validateUser(userModel);
      // hash the password
      userModel.password = await this.hashedPassword(userModel.password);

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
      // lower case the email
      request.email = request.email.toLowerCase();
      const cacheKey = `user:${request.email}`;
      let user = await this.redisSocketService.getCacheValue(cacheKey);

      // If no cached user, fetch from DB
      if (!user) {
        user = await this.getUser(request);
        if (!user) throw new Error("UserNotFound");

        // Cache user data for future use
        await this.redisSocketService.setCacheValue(cacheKey, user, 900); // Cache for 15 minuties
      }

      // Check if user is active
      if (!user.isActive) throw new Error("User is not active");

      // Check if password is correct
      const isPasswordMatch = await compare(request.password, user.password);
      if (!isPasswordMatch) throw new Error("InvalidCredentials");

      // Check user role
      const roleWithMenus = await this.getUserRole(user.role._id);
      if (!roleWithMenus) throw new Error("Invalid role. Role does not exist.");

      // Sanitize and set session
      const sanitizedUser = this.sanitizeUser(user, roleWithMenus);

      session.user = sanitizedUser;
      session.firebaseToken = {
        fcmToken: request.fcmToken,
        deviceInfo: request.deviceInfo,
      };

      // Return session data
      const token = await super.assignToken(session);
      return { session: token, user: session.user };
    } catch (err) {
      throw { message: err.message };
    }
  };

  // Helper methods
  getUserRole = async (roleId) => {
    // Cache check for roles
    const cacheKey = `role:${roleId}`;
    const cachedRole = await this.redisSocketService.getCacheValue(cacheKey);

    if (cachedRole) {
      return cachedRole;
    }

    const role = await this.companyRepository.findRoleById(roleId);
    if (role) {
      // Cache role data for future use
      await this.redisSocketService.setCacheValue(cacheKey, role, 900); // Cache for 15 minitues
    }
    return role;
  };

  getUser = async (request) => {
    const cacheKey = `user:${request.email}`;
    const cachedUser = await this.redisSocketService.getCacheValue(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userRepo.getUserByUsername(request.email);
    if (user) {
      // Cache user data for future use
      await this.redisSocketService.setCacheValue(cacheKey, user, 900); // Cache for 15 minitues
    }
    return user;
  };

  getUserById = async (id) => {
    const cacheKey = `user:id:${id}`;
    const cachedUser = await this.redisSocketService.getCacheValue(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userRepo.getUserById(id);
    if (user) {
      // Cache user data for future use
      await this.redisSocketService.setCacheValue(cacheKey, user, 900); // Cache for 15m
    }
    return user;
  };

  logout = async (userId) => {
    try {
      const userToken = await this.getTokenByUserIdAndDelete(userId);
      // Clear user cache on logout
      await this.redisSocketService.delCacheKey(`user:${userId}`);
      await this.redisSocketService.delCacheKey(
        `auth:token:${userToken.token}`
      );
      return super.prepareResponse({ message: "User logged out successfully" });
    } catch (err) {
      throw { message: err.message };
    }
  };

  updateUser = async (userModel, image, userId) => {
    try {
      // Validate email and role
      const existinguser = await this.validateUser(userModel, userId, true);
      if (userModel.password !== undefined && userModel.password !== "") {
        // hash the password
        userModel.password = await this.hashedPassword(userModel.password);
      } else {
        userModel.password = existinguser.password;
      }

      // Attempt to update user using userRepo
      const updateUserResponse = await this.userRepo.updateUser(
        userModel,
        image,
        userId
      );
      if (!updateUserResponse) {
        throw new Error("Failed to update user");
      }

      const sanitizedResponse = omit(updateUserResponse, [
        "password",
        "createdDate",
        "updatedDate",
        "__v",
      ]);

      // Clear user cache upon update
      await this.redisSocketService.delCacheKey(`user:${userId}`);

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
