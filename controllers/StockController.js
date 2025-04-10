const {Stock} = require("../models/Stocks"); // import of stock models
const BuyStock = require("../models/BuyStock");
const StockDTO = require("../dtos/StockDTO");
const CategoryDTO = require("../dtos/CategoryDTO");
const RequestHandler = require("../utils/RequestHandler");
const Logger = require("../utils/logger");

const {StockRepository} = require("../repositories/stockRepo");
const {StockService} = require("../services/stockService");

const stockRepository = new StockRepository(Stock);
const stockService = new StockService(stockRepository);

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

//add menus items
exports.saveStock = async (req, res) => {
    try {
        const lang = req.session.lang || "en"; // Default to English
        //create Dto
        const StockDto = new StockDTO(req.body, req.files, lang);
        // call service layer
        const response = await stockService.addStock(StockDto);
        // return response
        res.statusCode = response.statusCode;
        return res.json(response);
    } catch (err) {
        return requestHandler.sendError(req, res, err);
    }
};

exports.addCategory = async (req, res) => {
    try {
        const lang = req.session.lang || "en"; // Default to English

        // creating dto
        const categoryDto = new CategoryDTO(req.body);
        const response = await stockService.addCategory(categoryDto, lang);

        res.statusCode = response.statusCode;
        return res.json(response);
    } catch (err) {
        return requestHandler.sendError(req, res, err);
    }
};

exports.getAllCategory = async (req, res) => {
    try {
        const lang = req.session.lang || "en"; // Default to English

        const response = await stockService.getAllCategory();
        res.statusCode = response.statusCode;
        return res.json(response);
    } catch (err) {
        return requestHandler.sendError(req, res, err);
    } // end try catch
};
// get all the menus items
exports.getAllStock = async (req, res) => {
    try {
        // Set the language from query or default to 'en'
        const lang = req.session.lang || "en"; // Default to English

        const searchText = req.query.search || "";
        const type = req.query.searchType || "";
        const filterType = req.query.filterType || "";
        const categoryId = req.query.categoryId || "";

        let response;
        // Get pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const searchFilters = {
            searchText,
            type,
            page,
            limit,
            filterType,
            categoryId,
            lang,
        };
        // Validate the limit to avoid too many results
        if (limit >= 100) {
            const message = "Limit must be less than 100";
            throw {message: message};
        }
        response = await stockService.getAllStock(searchFilters);
        // Process response data
        if (response.statusCode === 200) {
            if (response.rsType === "Allstock" && response.data.length > 0) {
                response.data = response.data.map((item) => updateImageUrl(item, req));
            } else if (
                (response.rsType === "categoryWise" ||
                    response.rsType === "nameOfWeekWise") &&
                response.data.length > 0
            ) {
                response.data = response.data.map((category) => ({
                    ...category,
                    categoryName: {
                        ...category.categoryName,
                        items: category.categoryName.items.map((item) =>
                            updateImageUrl(item, req)
                        ),
                    },
                }));
            }
        }

        // Set the response status and send the response
        res.statusCode = response.statusCode;
        return res.json(response);
    } catch (err) {
        return requestHandler.sendError(req, res, err);
    }
};


const updateImageUrl = (item, req) => ({
    ...item,
    image: item.image
        ? `${req.protocol}://${req.get("host")}/public/${item.image}`
        : null, // If no image, set to null
});

exports.viewOne = (req, res) => {
    stock
        .findOne({_id: req.params.id})
        .then((stock) => {
            res.status(200).json({status: true, stock});
        })
        .catch(() => {
            res.status(201).json({status: true, message: "Operation failed"});
        });
};

exports.BuyStock = (req, res) => {
    id = req.userData._id;
    (stockName = req.body.stockName),
        (amount = req.body.amount),
        (quantity = req.body.quantity),
        (unit = req.body.Unit),
        (total = req.body.total);
    date = req.body.date;
    type = "Buy";

    new BuyStock({
        userID: id,
        stockName: stockName,
        quantity: quantity,
        Unit: unit,
        date: date,
        amount: amount,
        type: type,
        total: total,
    })
        .save()
        .then(() => {
            res
                .status(200)
                .json({status: true, message: "operation successfull !!"});
        })
        .catch((e) => {
            res.status(201).json({status: true, message: e.message});
        });
};

exports.GetStock = (req, res) => {
    userID = req.userData._id;
    BuyStock.find({userID: userID, type: "Buy"})
        .then((data) => {
            res.status(200).json({status: true, data});
        })
        .catch((e) => {
            res.status(201).json({status: true, message: e.message});
        });
};

exports.GetSingleBuyStock = (req, res) => {
    BuyStock.findOne({_id: req.params.id})
        .then((data) => {
            res.status(200).json({status: true, data});
        })
        .catch(() => {
            res.status(201).json({status: true, message: e.message});
        });
};

exports.SellStock = (req, res) => {
    id = req.userData._id;
    (stockName = req.body.stockName),
        (amount = req.body.amount),
        (quantity = req.body.quantity),
        (unit = req.body.Unit),
        (total = req.body.total);
    date = req.body.date;
    type = "Sell";

    new BuyStock({
        userID: id,
        stockName: stockName,
        quantity: quantity,
        Unit: unit,
        date: date,
        amount: amount,
        type: type,
        total: total,
    })
        .save()
        .then(() => {
            res
                .status(200)
                .json({status: true, message: "operation successfull !!"});
        })
        .catch((e) => {
            res.status(201).json({status: true, message: e.message});
        });
};

exports.GetSellStock = (req, res) => {
    userID = req.userData._id;
    BuyStock.find({userID: userID, type: "Sell"})
        .then((data) => {
            res.status(200).json({status: true, data});
        })
        .catch((e) => {
            res.status(201).json({status: true, message: e.message});
        });
};

exports.totalUnit = (req, res) => {
    id = req.userData._id.toString();
    BuyStock.aggregate([
        {$match: {$and: [{type: "Buy"}, {userID: id}]}},
        {
            $group: {
                _id: "$userID",
                totalUnit: {$sum: "$Unit"},
            },
        },
    ])
        .then((data) => {
            res.status(200).json({status: true, data});
        })
        .catch((e) => {
            console.log(e);
        });
};

exports.totalInvest = (req, res) => {
    id = req.userData._id.toString();
    BuyStock.aggregate([
        {$match: {$and: [{type: "Buy"}, {userID: id}]}},
        {
            $group: {
                _id: "$userID",
                totalUnit: {$sum: "$total"},
            },
        },
    ]).then((data) => {
        res.status(200).json({status: true, data});
    });
};
exports.totalSold = (req, res) => {
    id = req.userData._id.toString();
    BuyStock.aggregate([
        {$match: {$and: [{type: "Sell"}, {userID: id}]}},
        {
            $group: {
                _id: "$userID",
                totalUnit: {$sum: "$total"},
            },
        },
    ]).then((data) => {
        res.status(200).json({status: true, data});
    });
};
exports.currentAmount = (req, res) => {
    id = req.userData._id.toString();
    BuyStock.aggregate([
        {$match: {$and: [{type: "Buy"}, {userID: id}]}},
        {
            $group: {
                _id: "$userID",
                totalUnit: {$sum: "$amount"},
            },
        },
    ]).then((data) => {
        res.status(200).json({status: true, data});
    });
};
exports.OverAllprofit = (req, res) => {
    id = req.userData._id.toString();
    BuyStock.aggregate([
        {$match: {$and: [{type: "Buy"}, {userID: id}]}},
        {
            $group: {
                _id: "$userID",
                totalUnit: {$avg: "$total"},
            },
        },
    ]).then((data) => {
        res.status(200).json({status: true, data});
    });
};
