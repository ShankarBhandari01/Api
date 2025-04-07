const accessToken = require("../models/Token");
const userlog = require("../models/UserloginLog");
const Logger = require("../utils/logger");
const {DatabaseError} = require("../utils/errors");
const logger = new Logger();

class BaseRepository {
    async saveTokens(createdToken, user) {
        const { token, refreshToken } = createdToken;
      
        try {
          // First check if a token for this user already exists.
          const existingToken = await accessToken.findOne({ userId: user.id });
      
          // If token exists for the user, update it. Otherwise, insert a new token for the new user.
          if (existingToken) {
            // Update the existing token for this user
            await accessToken.findOneAndUpdate(
              { userId: user.id },
              {
                token: token,
                refreshToken: refreshToken,
                refreshExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
              },
              {
                new: true, // Return the updated document
              }
            );
          } else {
            // Create a new document for a new user login
            await accessToken.create({
              userId: user.id,
              token: token,
              refreshToken: refreshToken,
              refreshExpiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days expiry
            });
          }
          console.log('Token successfully saved or updated for user:', user.id);
        } catch (error) {
          console.error('Error saving or updating token:', error);
          throw new Error('Failed to save or update token');
        }
      }
      

    async insertUserLog(log) {
        try {
            return userlog.create(log);
        } catch (error) {
            logger.log(`Error while inserting user log ${error}`, 'error');
            await Promise.reject(error);
        }
    }

    async updateLogMsg(msg, id) {
        // Define the filter query to find the document to update
        const filter = {_id: id};

        // Define the update operation
        const update = {
            $set: {
                statusMsg: msg,
            },
        };

        // Update the document
        return userlog.updateOne(filter, update);
    }

    // reterive user token
    async getCurrentUserToken(token) {
        return accessToken.findOne({token: token}).lean();
    }

    async logout(userId) {
        try {
            return accessToken.findOneAndDelete({userId}).select(false);
        } catch (error) {
            await Promise.reject(error);
        }
    }

    uploadImage = async (image, session) => {
        try {
            return await image.save({session});
        } catch (err) {
            logger.log(`Error uploading image: ${err.message}`, "error");
            throw new DatabaseError("Error uploading image: " + err.message);
        }
    };
}

module.exports = BaseRepository;
