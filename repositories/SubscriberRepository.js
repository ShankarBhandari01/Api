const BaseRepository = require("./BaseRepository");
const {DatabaseError} = require("../utils/errors");

class SubscriberRepository extends BaseRepository {
    constructor(model) {
        super();
        this.model = model;
    }

    subscribe = async (subscribers) => {
        try {
            return await this.model.create(subscribers);
        } catch (error) {
            throw new DatabaseError(`Error adding subscribers: ${error.message}`);
        }
    }

    getSubscriberByEmail = async (email) => {
        try {
            return await this.model.findOne({email: email});
        } catch (error) {
            throw new DatabaseError(`Error getting subscribers: ${error.message}`);
        }
    }
    unsubscribe = async (email) => {
        try {
            return await this.model.deleteOne({email: email});
        } catch (error) {
            throw new DatabaseError(`Error deleting subscribers: ${error.message}`);
        }
    }
}

module.exports = {SubscriberRepository};
