//checking if the logged in user is authenticated or not 
const jwt = require('jsonwebtoken');
const User = require('../model/UserModel');
const customResourceResponse = require('../utlities/constants');

//main guards
module.exports.verifyUser = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        jwt.verify(token, 'secretkey', (err, decoded) => {
            if (err) {
                const response = {};
                response = customResourceResponse.invalidTokenAccess
                res.statusCode = response.statusCode;
                res.json(response);
            } else {
                req.userData = decoded
                next();
            }
        });


        // User.findOne({ _id: verifiedData.userId })
        //     .then((userInfo) => {
        //         req.userData = userInfo
        //         next();
        //     })
        //     .catch((err) => {
        //         res.status(400).json({ message: err.message })
        //     })
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }

}


