import BaseController from "./BaseController.js";

class SubscriberController extends BaseController {
  constructor({ req, res, subscriberService }) {
    super(req, res);
    this.subscriberService = subscriberService;
  }

  // Subscribe
  subscribe = async () => {
    await this.runServiceMethod(
      this.subscriberService,
      async (service) => {
        return await service.subscribe(this.req.body);
      },
      "Subscription successful"
    );
  };

  // Unsubscribe
  unsubscribe = async () => {
    await this.runServiceMethod(
      this.subscriberService,
      async (service) => {
        return await service.unsubscribe(this.req.body.email);
      },
      "Unsubscription successful"
    );
  };

  addCampaingn = async () => {
    await this.runServiceMethod(
      this.subscriberService,
      async (service) => {
        return await service.addCampaingn(this.req.body);
      },
      "Campain added successfully"
    );
  };
}

export default SubscriberController;
