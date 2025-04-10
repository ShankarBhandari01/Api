const BaseRepository = require("./BaseRepository");
const { DatabaseError } = require("../utils/errors");
const Subscriber = require("../models/SubscriberModel");

class SubscriberRepository extends BaseRepository {
  constructor(connection) {
    super(connection);
    this.model = Subscriber(connection);
    this.connection = connection;
  }

  subscribe = async (subscribers) => {
    try {
      return await this.model.create(subscribers);
    } catch (error) {
      throw new DatabaseError(`Error adding subscribers: ${error.message}`);
    }
  };

  getSubscriberByEmail = async (email) => {
    try {
      return await this.model.findOne({ email: email });
    } catch (error) {
      throw new DatabaseError(`Error getting subscribers: ${error.message}`);
    }
  };
  unsubscribe = async (email) => {
    try {
      await this.model.deleteOne({ email: email });
    } catch (error) {
      throw new DatabaseError(`Error deleting subscribers: ${error.message}`);
    }
  };

  getSubscribers = async () => {
    try {
      return await this.model.find();
    } catch (error) {
      throw new DatabaseError(`Error getting subscribers: ${error.message}`);
    }
  };

  sendMarketingEmail = async (message) => {};
}

module.exports = { SubscriberRepository };
