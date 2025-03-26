const {Schema, model} = require("mongoose");

const CompanyScheme = new Schema(
    {
        name: String,
        logo: String,
        address: String,
        phone: String,
        email: String,
        googleMap: String,
        description: {
            en: {type: String, default: "new listed"},
            fi: {type: String, default: "uusi listattu"},
        },
        created_at: {
            type: Date,
            default: Date.now,
        },
        updated_at: {
            type: Date,
            default: Date.now,
        },
        remarks: {
            en: {type: String, default: "new listed"},
            fi: {type: String, default: "uusi listattu"},
        }
    }
);
const Company = model("Company", CompanyScheme);
module.exports ={Company}
