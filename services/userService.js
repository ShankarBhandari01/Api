const { customResourceResponse } = require('../utlities/constants');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const lodash = require('lodash');
class UserService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }


    doSignUp = async (userModel) => {
        const response = {};
        //ToDO need to do data validation here

        userModel.password = await bcrypt.hash(userModel.password, 10)
        const addUserResponse = await this.userRepo.addUser(userModel);

        if (!addUserResponse) {
            response.message = customResourceResponse.serverError.message;
            response.statusCode = customResourceResponse.serverError.statusCode;
            return response;
        }
        response.message = customResourceResponse.reqCreated.message;
        response.statusCode = customResourceResponse.reqCreated.statusCode;
        response.data = addUserResponse;
        return response;
    }

    doLogin = async (request) => {
        const response = {};
        const user = await this.userRepo.getUserByUsername(request.username);
        if (user === null) {
            //username does not exits
            response = customResourceResponse.noUserFound;
            return response;
        }
        else {
            bcrypt.compare(requestpassword, user.password, (err, result) => {
                if (result === false) {
                    response = customResourceResponse.invalidCreadintial;
                    return response;
                }
                lodash.omit(user.password); //remove password l̥
                const token = assignToken(user);
                response = customResourceResponse.success;
                response.token = token;
                response.user = user
                return response;
            });
        }
    }

    assignToken = (user) => {
        // Set the options for token generation
        const options = {
            expiresIn: '1d', // Token will expire in 1 day
            algorithm: 'HS256',
            issuer: '',
            subject: '',
            audience: ''
        };
        return jwt.sign(user, 'secretkey',options);
    }
}

module.exports = {
    UserService,
};
