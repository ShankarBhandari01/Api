const User = require('../model/UserModel');
const jwt = require('jsonwebtoken');
exports.Signup = (req, res) => {
    User.create(req.body).then(() => {
        res.status(200).json({ status: true, message: "User Registered!!" })
    }).catch((e) => {
        res.status(201).json({ status: true, message: e })
    });
}
exports.login = (req, res) => {
    User.findOne({ username: req.body.username }).then((user) => {
        if (user === null) {
            //username does not exits
            return res.status(201).json({ success: false, message: "User does not exist. Please SignUp first" })
        }
        else {
            if (user.password === req.body.password) {
                const token = jwt.sign({ userId: user._id }, 'secretkey');
                res.status(200).json({ status: true,token, data: user,  })
            }
            else {
                res.status(201).json({ status: false, message: "Login Failed!!" })
            }
        }
    }).catch((e) => {
        res.status(500).json({ message: e })
    })
}