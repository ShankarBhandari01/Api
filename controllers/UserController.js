import BaseController from "./BaseController.js";
class UserController extends BaseController {
  constructor({ req, res, userService }) {
    super(req, res);
    this.userService = userService;
  }

  // Signup method
  signup = async () => {
    await this.runServiceMethod(
      this.userService,
      async (service) => {
        const bodyData = this.req.body;
        const image = this.req.files?.image || null;
        return await service.doSignUp(bodyData, image);
      },
      "User Created"
    );
  };

  // Refresh Token method
  refreshToken = async () => {
    await this.runServiceMethod(
      this.userService,
      async (service) => {
        return await service.refreshToken(this.req.session);
      },
      "Token Refreshed"
    );
  };

  // Login method
  login = async () => {
    await this.runServiceMethod(
      this.userService,
      async (service) => {
        const response = await service.doLogin(this.req.body, this.req.session);
        this.req.session.user = response.user;
        this.req.session.user._id = response.user._id;
        return response; // Return the response
      },
      "User Logged In"
    );
  };
  // Get all users method
  getAllUsers = async () => {
    await this.runServiceMethod(
      this.userService,
      async (service) => {
        return await service.getAllUsers();
      },
      "All Users Fetched"
    );
  };

  updateUser = async () => {
    await this.runServiceMethod(
      this.userService,
      async (service) => {
        const bodyData = this.req.body;
        const image = this.req.files?.image || null;
        const userId = this.req.params.id;
        return await service.updateUser(bodyData, image, userId);
      },
      "User Updated"
    );
  };

  getUserById = async () => {
    await this.runServiceMethod(
      this.userService,
      async (service) => {
        const userId = this.req.params.id;
        return await service.getUserById(userId);
      },
      "User Fetched"
    );
  };

  updateUserPassword = async () => {
    await this.runServiceMethod(
      this.userService,
      async (service) => {
        const userId = this.req.params.id;
        const bodyData = this.req.body;
        return await service.updateUser(bodyData, null, userId);
      },
      "User Password Updated"
    );
  };

  // Logout method
  logout = async () => {
    await this.runServiceMethod(
      this.userService,
      async (service) => {
        const user = this.req.session.user;
        if (!user || !user._id) {
          throw new Error("User not logged in");
        }

        const userId = user._id;
        const response = await service.logout(userId);

        if (response) {
          // Ensure session destruction is complete before clearing the cookie
          await new Promise((resolve, reject) => {
            this.req.session.destroy((err) => {
              if (err) {
                return reject(new Error("Logout session destruction failed"));
              }
              this.res.clearCookie("connect.sid");
              resolve();
            });
          });

          return { message: "User logged out successfully" };
        } else {
          throw new Error("Logout service failed");
        }
      },
      "User Logged Out"
    );
  };
}

export default UserController;
