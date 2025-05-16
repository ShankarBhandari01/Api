import BaseController from "./BaseController.js";

class PredictionController extends BaseController {
  constructor({ req, res, predictionService }) {
    super(req, res);
    this.predictionService = predictionService;
  }

  async predict() {
    try {
      const newPrediction = {
        customerId: "cus_001",
        menuItems: ["Margherita Pizza", "Garlic Bread", "Coke"],
      };

      const { customerId, menuItems } = newPrediction;
      await this.runServiceMethod(
        this.predictionService,
        async (service) => {
          const response = await service.getRecommendation(
            customerId,
            menuItems
          );
          return response;
        },
        "Prediction created successfully"
      );
    } catch (error) {
      this.res.status(500).json({ error: "Failed to create prediction" });
    }
  }
}

export default PredictionController;
