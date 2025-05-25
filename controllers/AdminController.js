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
  async uploadVideoLinks() {
    await this.runServiceMethod(
      this.adminService,
      (service) => service.uploadVideoLinks(this.req.body),
      "Video links uploaded successfully"
    );
  }

  async getVideoLinks() {
    await this.runServiceMethod(
      this.adminService,
      (service) => service.getVideoLinks(),
      "Video links retrieved successfully"
    );
  }

  async updateVideoLink() {
    const { id } = this.req.params;
    await this.runServiceMethod(
      this.adminService,
      (service) => service.updateVideoLinks(id, this.req.body),
      "Video link updated successfully"
    );
  }
  async deleteVideoLinks() {
    const { id } = this.req.params;
    await this.runServiceMethod(
      this.adminService,
      (service) => service.deleteVideo(id),
      "Video link deleted successfully"
    );
  }
}

export default AdminController;
