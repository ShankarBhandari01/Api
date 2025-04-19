const { UserService } = require("../services/userService");
const BaseController = require("./BaseController");

class UserController extends BaseController {
  constructor(req, res) {
    super(req, res);
  }

  // Signup method
  signup = async () => {
    await this.runServiceMethod(
      UserService,
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
      UserService,
      async (service) => {
        return await service.assignToken(this.req.session);
      },
      "Token Refreshed"
    );
  };

  // Login method
  login = async () => {
    await this.runServiceMethod(
      UserService,
      async (service) => {
        return await service.doLogin(this.req.body, this.req.session);
      },
      "User Logged In"
    );
  };

  // Logout method
  logout = async () => {
    await this.runServiceMethod(
      UserService,
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

module.exports = UserController;
