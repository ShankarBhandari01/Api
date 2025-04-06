const BaseRepo = require("./BaseRepository");
const mongoose = require("mongoose");
const Logger = require("../utils/logger");
const {DatabaseError} = require("../utils/errors");
const logger = new Logger();
const {Table} = require("../model/Reservation");

class CompanyRepository extends BaseRepo {
    constructor(companyModel) {
        super();
        this.company = companyModel;
    }

    getCompanyInfo = async () => {
        try {
            return await this.company
                .findOne()
                .populate("openingHours")
                .populate("logo")
                .sort({created_at: -1})
                .lean();
        } catch (err) {
            logger.log(`Error retrieving user by email: ${err.message}`, "error");
            throw new DatabaseError(`Error retrieving user by email: ${err.message}`);
        }
    };
    addCompanyInfo = async (companyInfo, image) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const uploadedImage = await this.uploadImage(image, session);
            companyInfo.logo = uploadedImage.id;

            const company = await this.company
                .findOneAndUpdate(
                    {name: companyInfo.name},
                    {
                        $set: {
                            ...companyInfo,
                            updated_at: new Date(),
                        },
                    },
                    {
                        upsert: true,
                        new: true,
                        session,
                    }
                )
                .populate("logo") // Populate the 'logo' reference
                .populate("openingHours")
                .lean();
            await session.commitTransaction();
            return company;
        } catch (err) {
            logger.log(`Error retrieving user by email: ${err.message}`, "error");
            await session.abortTransaction();
            throw new DatabaseError(`Error retrieving user by email: ${err.message}`);
        } finally {
            await session.endSession();
        }
    };


    addTable = async (table) => {
        try {
            return await new Table(table).save();
        } catch (err) {
            throw new DatabaseError(`Error retrieving user by email: ${err.message}`);
        }
    }
}

module.exports = CompanyRepository;
