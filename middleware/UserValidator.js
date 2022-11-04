const { check, validationResult } = require('express-validator')

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
        if (!errors.isEmpty())
            return res.status(422).json(errors.array());
        next();
    }
]
