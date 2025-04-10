const fs = require('fs');
const crypto = require('crypto');
const dotenv = require('dotenv');

const algorithm = 'aes-256-cbc';
const password = 'your-encryption-password'; 

// Function to decrypt the content
function decrypt(text) {
  const decipher = crypto.createDecipheriv(algorithm, password);
  let decrypted = decipher.update(text, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Middleware function
function decryptEnvMiddleware(req, res, next) {
  try {
    // Read the encrypted .env.enc file
    fs.readFile('./.env.enc', 'utf8', (err, data) => {
      if (err) {
        console.log('Error reading encrypted .env file', err);
        return next(err);  // Proceed to error handling if reading fails
      }

      // Decrypt the content
      const decryptedData = decrypt(data);

      // Write the decrypted content to a temporary .env file
      fs.writeFileSync('.env', decryptedData);

      // Now load environment variables
      dotenv.config();

      next(); // Proceed to the next middleware or route handler
    });
  } catch (err) {
    console.error('Error during decryption', err);
    next(err);  // Handle errors by passing to the next error handler
  }
}

module.exports = decryptEnvMiddleware;
