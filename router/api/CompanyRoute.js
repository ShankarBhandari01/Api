const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const {
    getCompanyInfo,
    addCompanyInfo
} = require('../../controllers/CompanyController');


router.get("/getCompanyInfo", getCompanyInfo)
router.post("/addCompanyInfo", auth.isAuthunticated, addCompanyInfo)

module.exports = router;