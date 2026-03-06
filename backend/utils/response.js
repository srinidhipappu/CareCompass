const successResponse = (data, message = '') => ({ success: true, data, message });
const errorResponse = (error) => ({ success: false, error });

module.exports = { successResponse, errorResponse };
