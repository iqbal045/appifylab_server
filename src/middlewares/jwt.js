const expressJwt = require('express-jwt');
const openRoutes = require('./openRoutes');

function authJwt() {
  return expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'],
    // isRevoked,
  }).unless({
    path: openRoutes,
  });
}

// async function isRevoked(req, payload, done) {
//   if (!payload.isAdmin || !payload.isModerator)
//     done(null, true);
//   }
// }

module.exports = authJwt;
