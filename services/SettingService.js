import BaseService from "./BaseService.js";

class SettingService extends BaseService {
  constructor({ connection, settingRepository }) {
    super(connection);
    this.settingRepository = settingRepository;
  }

  getSettings = async () =>
    await this.handleRepositoryCall(this.settingRepository.getSettings);

  // Example: Update settings
  async updateSettings(newSettings) {
    // TODO Implement logic to update settings
    return newSettings;
  }
}

export default SettingService;
