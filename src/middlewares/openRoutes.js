const config = require('config');

const api = config.get('API_URL');

// public routes that doesn't require authentication
const openRoutes = [
  // For User

  {
    url: /\/api\/user\/auth\/verify(.*)/,
    method: ['GET', 'OPTIONS'],
  },

  // upload resources
  {
    url: /\/uploads\/media\/.*/,
    method: ['GET', 'OPTIONS'],
  },

  // For Auth
  {
    url: `${api}/user/auth/login`,
    method: ['POST', 'OPTIONS'],
  },
  {
    url: `${api}/user/auth/register`,
    method: ['POST', 'OPTIONS'],
  },
  {
    url: `${api}/user/auth/forget-password`,
    method: ['POST', 'OPTIONS'],
  },
  {
    url: `${api}/user/auth/verify-otp`,
    method: ['POST', 'OPTIONS'],
  },
  {
    url: `${api}/user/auth/reset-password`,
    method: ['POST', 'OPTIONS'],
  },

  // common routes
  {
    url: '/',
    method: ['GET', 'OPTIONS'],
  },
  {
    url: '/*',
    method: ['GET', 'OPTIONS'],
  },
];

module.exports = openRoutes;
