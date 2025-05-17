import BaseRepository from "./BaseRepository.js";
import Setting from "../models/setting.model.js";

class SettingRepository extends BaseRepository {
  constructor({ connection }) {
    super(connection);
    this.connection = connection;
    this.settingsModel = Setting(connection);
  }

  getSettings = async () => {
    try {
      const settings = await settingsModel.find().toArray();
      return settings;
    } catch (error) {
      this.log(`[Api] Error fetching settings: ${error}`, "error");
      throw new Error(`Error fetching settings: ${error}`);
    }
  };
  saveSettingv = async (newSetting) => {
    return await this.settingsModel.create(newSetting);
  };
}

export default SettingRepository;
