const BaseController = require("./BaseController");
const { SubscriberService } = require("../services/SubscriberService");

class SubscriberController extends BaseController {
  constructor(req, res) {
    super(req, res);
  }

  // Subscribe
  subscribe = async () => {
    await this.runServiceMethod(
      SubscriberService,
      async (service) => {
        return await service.subscribe(this.req.body);
      },
      "Subscription successful"
    );
  };

  // Unsubscribe
  unsubscribe = async () => {
    await this.runServiceMethod(
      SubscriberService,
      async (service) => {
        return await service.unsubscribe(this.req.body.email);
      },
      "Unsubscription successful"
    );
  };

  // Send Marketing Email
  sendMarketingEmail = async () => {
    await this.runServiceMethod(
      SubscriberService,
      async (service) => {
        return await service.sendMarketingEmail(this.req.body);
      },
      "Marketing email sent successfully"
    );
  };

  getAll = async () => {
    // Implementation for getting all subscribers if needed in the future.
    // E.g., you can add pagination or search filters.
  };
}

module.exports = { SubscriberController };
