const { errorResponse } = require('../utils/response');

module.exports = (err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json(errorResponse('Internal server error'));
};
