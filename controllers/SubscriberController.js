const BaseController = require("./BaseController");
const {Subscriber} = require("../models/subscriberModel");

const {SubscriberRepository} = require("../repositories/SubscriberRepository");
const {SubscriberService} = require("../services/SubscriberService");

const repository = new SubscriberRepository(Subscriber);
const service = new SubscriberService(repository)

class SubscriberController extends BaseController {
    constructor(req, res) {
        super(req, res);
    }

    subscribe = async () => {
        try {
            const response = await service.subscribe(this.req.body);
            this.sendResponse(response, "success");
        } catch (error) {
            this.sendError(error);
        }
    }

    getAll = async () => {

    }

    unsubscribe = async () => {
        try {
            const response = await service.unsubscribe(this.req.body.email);
            this.sendResponse(response, "success");
        } catch (error) {
            this.sendError(error);
        }

    }

    sendMarketingEmail = async () => {
        try{
            const response = await service.sendMarketingEmail(this.req.body)
        }catch (error) {
            this.sendError(error);
        }

    }
}

module.exports = {SubscriberController}; //export the controller
