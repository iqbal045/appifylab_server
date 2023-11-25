const jwt_decode = require('jwt-decode');
const response = require('../helpers/response');

const is_User = async (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    const decoded = await jwt_decode(token);
    if (decoded.role === 'user') {
      next();
    } else {
      response.error(
        res,
        {},
        'You are not authorized to access this route.',
        403,
      );
    }
  } else {
    res.status(401).json({
      message: 'Error Occurred! The user is not authenticated.',
    });
  }
};

module.exports = is_User;
