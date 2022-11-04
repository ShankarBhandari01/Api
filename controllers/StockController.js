const stock = require("../model/Stocks"); // import of stock model 
const BuyStock = require("../model/BuyStock");
exports.AddStock = (req, res) => {
    stock.create(req.body).then(() => {
        res.status(200).json({ status: true, message: "Stock Added!!" })
    }).catch((e) => {
        res.status(201).json({ status: true, message: "Operation failed" })
    });
}
exports.getAllStock = (req, res) => {
    stock.find().then((data) => {
        res.status(200).json({ status: true, data: data })
    }).catch((e) => {
        res.status(201).json({ status: true, message: "Operation failed" })
    });
}
exports.viewOne = (req, res) => {
    stock.findOne({ _id: req.params.id }).then((stock) => {
        res.status(200).json({ status: true, stock })
    }).catch((e) => {
        res.status(201).json({ status: true, message: "Operation failed" })
    })
}

exports.BuyStock = (req, res) => {
    id = req.userData._id
    stockName = req.body.stockName,
        amount = req.body.amount,
        quantity = req.body.quantity,
        unit = req.body.Unit,
        total = req.body.total
    date = req.body.date
    type = "Buy"

    new BuyStock({
        userID: id,
        stockName: stockName,
        quantity: quantity,
        Unit: unit,
        date: date,
        amount: amount,
        type: type,
        total: total
    }).save().then(() => {
        res.status(200).json({ status: true, message: "operation successfull !!" })
    }).catch((e) => {
        res.status(201).json({ status: true, message: e })
    })

}

exports.GetStock = (req, res) => {
    userID = req.userData._id
    BuyStock.find({ userID: userID, type: 'Buy' }).then((data) => {
        res.status(200).json({ status: true, data })
    }).catch((e) => {
        res.status(201).json({ status: true, message: e })
    })
}

exports.GetSingleBuyStock = (req, res) => {
    BuyStock.findOne({ _id: req.params.id }).then((data) => {
        res.status(200).json({ status: true, data })

    }).catch(() => {
        res.status(201).json({ status: true, message: e })
    })
}

exports.SellStock = (req, res) => {
    id = req.userData._id
    stockName = req.body.stockName,
        amount = req.body.amount,
        quantity = req.body.quantity,
        unit = req.body.Unit,
        total = req.body.total
    date = req.body.date
    type = "Sell"

    new BuyStock({
        userID: id,
        stockName: stockName,
        quantity: quantity,
        Unit: unit,
        date: date,
        amount: amount,
        type: type,
        total: total
    }).save().then(() => {
        res.status(200).json({ status: true, message: "operation successfull !!" })
    }).catch((e) => {
        res.status(201).json({ status: true, message: e })
    })

}

exports.GetSellStock = (req, res) => {
    userID = req.userData._id
    BuyStock.find({ userID: userID, type: 'Sell' }).then((data) => {
        res.status(200).json({ status: true, data })
    }).catch((e) => {
        res.status(201).json({ status: true, message: e })
    })
}

exports.totalUnit = (req, res) => {
    id = req.userData._id.toString()
    BuyStock.aggregate([
        { $match: { $and:[{type:"Buy"},{userID:id}] } },
        { $group: { _id: "$userID", totalUnit: { $sum: "$Unit" } } },
    ]).then((data) => {
        res.status(200).json({ status: true, data })
    }).catch((e)=>{
        console.log(e)
    })
}


exports.totalInvest = (req, res) => {
    id = req.userData._id.toString()
    BuyStock.aggregate([
        { $match: { $and:[{type:"Buy"},{userID:id}] } },
        { $group: { _id: "$userID", totalUnit: { $sum: "$total" } } },
    ]).then((data) => {
        res.status(200).json({ status: true, data })
    })
   
}
exports.totalSold = (req, res) => {
    id = req.userData._id.toString()
    BuyStock.aggregate([
        { $match: { $and:[{type:"Sell"},{userID:id}] } },
        { $group: { _id: "$userID", totalUnit: { $sum: "$total"} } },
    ]).then((data) => {
        res.status(200).json({ status: true, data })
    })
}
exports.currentAmount = (req, res) => {
    id = req.userData._id.toString()
    BuyStock.aggregate([
        { $match: { $and:[{type:"Buy"},{userID:id}] } },
        { $group: { _id: "$userID", totalUnit: { $sum: "$amount" } } },
    ]).then((data) => {
        
        res.status(200).json({ status: true, data })
    })
}
exports.OverAllprofit = (req, res) => {
    id = req.userData._id.toString()
    BuyStock.aggregate([
        { $match: { $and:[{type:"Buy"},{userID:id}] } },
        { $group: { _id: "$userID", totalUnit: { $avg: "$total" } } },
    ]).then((data) => {
        res.status(200).json({ status: true, data })
    })
}

