const customResourceResponse = {}; // create empty objectl

customResourceResponse.success = { statusCode: 200, message: 'Request has been processed successfully.' };
customResourceResponse.reqCreated = { statusCode: 201, message: 'Record has been created successfully.' };
customResourceResponse.recordNotFound = { statusCode: 404, message: 'No record found.' };
customResourceResponse.serverError = { statusCode: 500, message: 'Internal server error.' };
customResourceResponse.reqValidationError = { statusCode: 422, message: 'Data validation failed.' };
customResourceResponse.noUserFound = { statusCode: 400, message: 'User does not exist. Please SignUp first.' };
customResourceResponse.invalidCreadintial = {statusCode: 400, message: 'Username or password incorrect'};
customResourceResponse.invalidTokenAccess = { statusCode: 401, message: "Invalid Token access" };

module.exports = customResourceResponse;