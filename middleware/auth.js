//checking if the logged in user is authenticated or not 
const jwt = require('jsonwebtoken');
const User = require('../model/UserModel');

//main guards
module.exports.verifyUser = function (req, res, next) {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const verifiedData = jwt.verify(token, 'secretkey');
        User.findOne({ _id: verifiedData.userId })
            .then(function (userInfo) {
                req.userData=userInfo
                next();
            })
            .catch(function (err) {
                res.status(400).json({ message: err })
            })
    }
    catch (err) {
        res.status(500).json({ message: err })
    }

}


