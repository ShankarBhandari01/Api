const { customResourceResponse } = require('../utlities/constants');

class UserService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }


    async doSignUp(userModel) {
        const response = {};
        const user = await this.userRepo.addUser(userModel);

        if (!user) {
            response.message = customResourceResponse.serverError.message;
            response.statusCode = customResourceResponse.serverError.statusCode;
            return response;
        }
        response.message = customResourceResponse.reqCreated.message;
        response.statusCode = customResourceResponse.reqCreated.statusCode;
        response.data = user;
        return response;
    }
}

module.exports = {
    UserService,
};
