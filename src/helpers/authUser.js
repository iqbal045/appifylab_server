const jwt_decode = require('jwt-decode');
const response = require('./response');

const authUser = async (res, token) => {
  try {
    if (token) {
      const decoded = await jwt_decode(token);
      return decoded.admin_id;
    }
  } catch (error) {
    return response.error(res, error, 'Error decoding token', 401);
  }
};

module.exports = authUser;
