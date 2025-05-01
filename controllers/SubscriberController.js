import BaseController from "./BaseController.js";
import SubscriberService  from "../services/SubscriberService.js";

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

  addCampaingn = async () => {
    await this.runServiceMethod(
      SubscriberService,
      async (service) => {
        return await service.addCampaingn(this.req.body);
      },
      "Campain added successfully"
    );
  };
}

export default SubscriberController;
