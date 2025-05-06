import BaseController from "./BaseController.js";
import SubscriberService from "../services/SubscriberService.js";

class SubscriberController extends BaseController {
  constructor({ subscriberService }) {
    super(req, res);
    this.subscriberService = subscriberService;
  }

  // Subscribe
  subscribe = async (req, res) => {
    await this.runServiceMethod(
      SubscriberService,
      async (service) => {
        return await service.subscribe(req.body);
      },
      "Subscription successful"
    );
  };

  // Unsubscribe
  unsubscribe = async (req, res) => {
    await this.runServiceMethod(
      SubscriberService,
      async (service) => {
        return await service.unsubscribe(req.body.email);
      },
      "Unsubscription successful"
    );
  };

  addCampaingn = async (req, res) => {
    await this.runServiceMethod(
      SubscriberService,
      async (service) => {
        return await service.addCampaingn(req.body);
      },
      "Campain added successfully"
    );
  };
}

export default SubscriberController;
