import { customResourceResponse } from '../utlities/constants';

class UserService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }


    doSignUp = async(userModel) => {
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

export default {
    UserService,
};
