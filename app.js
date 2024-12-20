const http = require('http');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require("express-rate-limit");
const cookieParser = require('cookie-parser');
const cors = require('cors');
const package = require('./package.json');

// If process.env.NODE_ENV is not defined, check .env file
if (!process.env.NODE_ENV) {
    console.log('NODE_ENV not defined, checking .env file');
    require('dotenv').config();
}

// server configuration
const PORT = process.env.PORT || 3000;
const app = express();

// Apply rate limiter to all requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware
const corsOptions = {
    origin: [
        'http://loopback.gmod:3000',
        'http://loopback.gmod:3030',
        'http://loopback.gmod:8080',
        'http://localhost:3000',
        'http://localhost:3030',
        'http://localhost:8080',
        'https://papi-staging.palominorp.com',
        'https://papi.palominorp.com',
        'https://pal-os.palominorp.com',
        'https://auth.palominorp.com',
    ],
    credentials: true,
}
app.use(cors(corsOptions));
app.use(morgan('combined')); // HTTP request logger
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());

const sequelize = require('./src/services/db');

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const setupWebSockets = require('./src/websockets'); // Import the WebSocket setup function
setupWebSockets(server); // Set up the WebSocket server

// serve static files
app.use('/public', express.static('public'));

// routes
const ui = require('./src/routes/client/uiRoutes');
app.use('/ui', ui);

const serverRoutes = require('./src/routes/serverRoutes');
app.use('/server', serverRoutes);

const clientRoutes = require('./src/routes/clientRoutes');
app.use('/client', clientRoutes);

// '/' route
app.get('/', (req, res) => {
    res.json({
        "version": package.version
    });
});

// global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Server start
server.listen(PORT, () => {
    console.log(`P-API v${package.version} started on port ${PORT}`);
});
