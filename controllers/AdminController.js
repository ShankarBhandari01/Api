import BaseController from "./BaseController.js";

class AdminController extends BaseController {
  constructor({ req, res, adminService }) {
    super(req, res);
    this.req = req;
    this.res = res;
    this.adminService = adminService;
  }
  /**
   * Update CORS whitelist
   * @returns {Promise<void>}
   */
  async updateCorsWhitelist() {
    const { domains } = this.req.body;
    await this.runServiceMethod(
      this.adminService,
      (service) => service.updateCorsWhitelist(domains),
      "CORS whitelist updated successfully"
    );
  }
}

export default AdminController;
