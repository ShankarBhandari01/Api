import BaseService from "./BaseService.js";
class PredictionService extends BaseService {
  constructor({ mlClient, connection }) {
    super(connection);
    this.mlClient = mlClient;
  }
  async getRecommendation(customerId, menuItems) {
    const response = await this.mlClient.predict({
      customer_id: customerId,
      menu_items: menuItems,
    });
    return response.recommended_dish;
  }
}

export default PredictionService;
