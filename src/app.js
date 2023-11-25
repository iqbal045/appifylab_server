const express = require('express');
const cors = require('cors');

const path = require('path');
const appMiddleware = require('./middlewares/middleware'); // Middleware
const appRouter = require('./routes/router'); // Router
const errorHandler = require('./middlewares/errorHandler');

// Server
const app = express();
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Middleware
appMiddleware(app);
app.options('*', cors());

// Router
appRouter(app);

// Error Handler
app.use(errorHandler);

module.exports = app;
