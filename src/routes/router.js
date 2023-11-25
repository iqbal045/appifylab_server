const config = require('config');

// user handlers
const userAuthRoutes = require('./authRoutes');
const feedRoutes = require('./feedRoutes');
const commentRoutes = require('./commentRoutes');
const replyRoutes = require('./replyRoutes');

// env_config
const api = config.get('API_URL');

const routes = [
  // User Routes
  {
    path: `${api}/user/auth`,
    handler: userAuthRoutes,
  },
  {
    path: `${api}/feeds`,
    handler: feedRoutes,
  },
  {
    path: `${api}/comments`,
    handler: commentRoutes,
  },
  {
    path: `${api}/replies`,
    handler: replyRoutes,
  },

  // Common Routes
  {
    path: '/', // root route
    handler: (req, res) => {
      res.status(200).json({
        message: 'Welcome to our src.',
        success: true,
      });
    },
  },
  {
    path: '/*', // 404 response path
    handler: (req, res) => {
      res.status(404).json({
        message: `Error: 404, Url Not Found!`,
        success: false,
      });
    },
  },
  {
    path: '/*/:path*', // 404 response path
    handler: (req, res) => {
      res.status(404).json({
        message: `Error: 404, Url Not Found!`,
        success: false,
      });
    },
  },
];

module.exports = app => {
  routes.forEach(r => {
    if (r.path === '/') {
      app.get(r.path, r.handler);
    } else {
      app.use(r.path, r.handler);
    }
  });
};
