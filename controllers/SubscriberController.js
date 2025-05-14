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
  // get all list
  getAllSubscribe = async () => {
    await this.runServiceMethod(
      this.subscriberService,
      async (service) => {
        return await service.getAllSubscribe();
      },
      "All Subscribe list  successful"
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
        const bodyData = this.req.body;
        const image = this.req.files?.image || null;
        return await service.addCampaingn(bodyData, image);
      },
      "Campain added successfully"
    );
  };
  // update campaign
  updateCampaign = async () => {
    const image = this.req.files?.image || null;
    const { id } = this.req.params;
    await this.runServiceMethod(this.subscriberService, async (service) => {
      return await service.updateCampaign(id, this.req.body, image);
    });
  };

  getAllCampaigns = async () => {
    await this.runServiceMethod(this.subscriberService, async (service) => {
      return await service.getAllCampaigns();
    });
  };
  getActiveCampaign = async () => {
    await this.runServiceMethod(this.subscriberService, async (service) => {
      return await service.getActiveCampaign();
    });
  };

  deleteCampign = async () => {
    const { id } = this.req.params;
    await this.runServiceMethod(this.subscriberService, async (service) => {
      return await service.deleteCampaign(id);
    });
  };
}

export default SubscriberController;
