const { check, validationResult } = require('express-validator');
const customResourceResponse = require('../utlities/constants');

exports.uservalidator = [
    check('name')
        .trim()
        .not()
        .isEmpty()
        .withMessage('name can not be empty!'),
    check('address')
        .trim()
        .not()
        .isEmpty()
        .withMessage('address can not be empty!'),
    check('email')
        .trim()
        .not()
        .isEmpty()
        .withMessage('email can not be empty!')
        .isEmail()
        .withMessage('Invalid email address!'),
    check('password')
        .trim()
        .not()
        .isEmpty()
        .withMessage('password can not be empty!'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const response = {};
            response.status = customResourceResponse.reqValidationError.statusCode;
            response.message = customResourceResponse.reqValidationError.message;
            response.data = errors.array()
            res.statusCode = response.status;
            return res.json(response);
        }
        next();
    }
]
