const { check, validationResult } = require('express-validator')

exports.stockvalidator = [
    check('stockName')
        .trim()
        .not()
        .isEmpty()
        .withMessage('stockName can not be empty!'),
    check('amount')
        .trim()
        .not()
        .isEmpty()
        .withMessage('amount can not be empty!'),
    check('description')
        .trim()
        .not()
        .isEmpty()
        .withMessage('description can not be empty!'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json(errors.array());
        next();
    }
]
