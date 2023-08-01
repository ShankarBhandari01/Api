
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { UserRepository } = require('../repo/userRepo').default;
const { UserService } = require('../services/userService').default;

const UserModel = require('../model/UserModel');
const userRepository = new UserRepository(UserModel);
const userService = new UserService(userRepository);

exports.Signup = async (req, res, next) => {
    console.log("Sign up " + JSON.stringify(req.body));
    
    try {
        const response = await userService.doSignUp(req.body);
        res.statusCode = response.statusCode;
        return res.json({ message: response.message, data: response.data });
    } catch (err) {
        next(err);
    }



    // req.body.password = await bcrypt.hash(req.body.password, 10);
    // UserModel.create(req.body).then(() => {
    //     res.status(200).json({ status: true, message: "User Registered!!" })
    // }).catch((e) => {
    //     res.status(201).json({ status: true, message: e.message })
    // });
}
exports.login = (req, res) => {

    
    UserModel.findOne({ username: req.body.username }).then((user) => {
        if (user === null) {
            //username does not exits
            return res.status(201).json({ success: false, message: "User does not exist. Please SignUp first" })
        }
        else {
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (result === false) {
                    return res.status(201).json({ success: false, message: "Username or password incorrect!!" })
                }
                const token = jwt.sign({ userId: user._Id }, 'secretkey');
                res.status(200).json({ status: true, token, user })
            })
            // if (user.password === req.body.password) {

            // }
            // else {
            //     res.status(201).json({ status: false, message: "Login Failed!!" })
            // }
        }
    }).catch((e) => {
        res.status(400).json({ message: e.message })
    })
}