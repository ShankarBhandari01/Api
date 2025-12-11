import BaseController from "./BaseController.js";

class ReportingController extends BaseController {
  constructor({ req, res, reportingService }) {
    super(req, res);
    this.reportingService = reportingService
  }

  getCompanyReport = async () => {
    await this.runServiceMethod(
      this.reportingService,
      (service) => service.getCompanyReport(),
      "Reports generated successfully"
    )
  }
}

export default ReportingController