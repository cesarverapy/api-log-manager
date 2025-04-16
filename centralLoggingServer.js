const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const net = require('net');

// Initialize Winston logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/server.log' })
    ]
});

const app = express(); // inicializamos la aplicacion express
app.use(bodyParser.json()); // configuramos express para usar body-parser y procesar json en las peticiones

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS) : 15 * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX_REQUESTS ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) : 100
});
app.use(limiter);

// Configuration
const config = {
    port: process.env.PORT || 5001,
    logFile: path.join(__dirname, 'logs', 'api-logs.json'),
    validTokens: process.env.AUTH_TOKENS ? process.env.AUTH_TOKENS.split(',') : ['service1_token', 'service2_token'],
    maxLogSize: process.env.MAX_LOG_SIZE ? parseInt(process.env.MAX_LOG_SIZE) : 1000000,
    maxLogFiles: process.env.MAX_LOG_FILES ? parseInt(process.env.MAX_LOG_FILES) : 5,
    portRange: {
        start: 5001,
        end: 5010
    }
};

// Function to check if a port is available
function isPortAvailable(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', () => {
            resolve(false);
        });
        server.once('listening', () => {
            server.close();
            resolve(true);
        });
        server.listen(port);
    });
}

// Function to find an available port
async function findAvailablePort() {
    for (let port = config.portRange.start; port <= config.portRange.end; port++) {
        if (await isPortAvailable(port)) {
            return port;
        }
    }
    throw new Error('No available ports found in the specified range');
}

// Ensure logs directory exists
if (!fs.existsSync(path.join(__dirname, 'logs'))) {
    fs.mkdirSync(path.join(__dirname, 'logs'));
}

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Error:', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'Internal server error' });
});

// Function to ensure log file exists and rotate if needed
function ensureLogFile() {
    if (!fs.existsSync(config.logFile)) {
        fs.writeFileSync(config.logFile, JSON.stringify([]));
        return;
    }

    const stats = fs.statSync(config.logFile);
    if (stats.size > config.maxLogSize) {
        rotateLogs();
    }
}

// Function to rotate logs
function rotateLogs() {
    for (let i = config.maxLogFiles - 1; i > 0; i--) {
        const currentFile = `${config.logFile}.${i}`;
        const nextFile = `${config.logFile}.${i + 1}`;
        if (fs.existsSync(currentFile)) {
            fs.renameSync(currentFile, nextFile);
        }
    }
    fs.renameSync(config.logFile, `${config.logFile}.1`);
    fs.writeFileSync(config.logFile, JSON.stringify([]));
}

// Function to save logs with error handling
function saveLog(data) {
    try {
        ensureLogFile();
        const logs = JSON.parse(fs.readFileSync(config.logFile));
        const logEntry = {
            ...data,
            receivedAt: new Date().toISOString(),
            ip: data.ip || 'unknown'
        };
        logs.push(logEntry);
        fs.writeFileSync(config.logFile, JSON.stringify(logs, null, 4));
        logger.info('Log saved successfully', { service: data.service_name, level: data.log_level });
    } catch (error) {
        logger.error('Error saving log:', { error: error.message, stack: error.stack });
        throw new Error('Failed to save log');
    }
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || !config.validTokens.includes(token)) {
        logger.warn('Unauthorized access attempt', { ip: req.ip });
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// Request logging middleware
app.use((req, res, next) => {
    logger.info('Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip
    });
    next();
});

// Routes
app.post('/logs', authenticateToken, (req, res) => {
    try {
        const logData = req.body;
        if (!logData || !logData.message) {
            return res.status(400).json({ error: 'Invalid log data' });
        }
        
        logData.ip = req.ip;
        saveLog(logData);
        res.status(200).json({ message: 'Log received successfully' });
    } catch (error) {
        logger.error('Failed to process log', { error: error.message });
        res.status(500).json({ error: 'Failed to process log' });
    }
});

app.get('/logs', (req, res) => {
    try {
        ensureLogFile();
        const logs = JSON.parse(fs.readFileSync(config.logFile));
        res.json(logs);
    } catch (error) {
        logger.error('Failed to retrieve logs', { error: error.message });
        res.status(500).json({ error: 'Failed to retrieve logs' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
    const stats = fs.statSync(config.logFile);
    res.json({
        logFileSize: stats.size,
        lastModified: stats.mtime,
        uptime: process.uptime()
    });
});

// Start server with error handling and port management
async function startServer() {
    try {
        const port = await findAvailablePort();
        const server = app.listen(port, () => {
            logger.info(`Central logging server is running on port ${port}`);
        }).on('error', (err) => {
            logger.error('Server error:', { error: err.message });
            process.exit(1);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                logger.info('Server closed');
                process.exit(0);
            });
        });

        process.on('uncaughtException', (err) => {
            logger.error('Uncaught Exception:', { error: err.message, stack: err.stack });
            process.exit(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection:', { reason: reason.message });
        });

        return server;
    } catch (error) {
        logger.error('Failed to start server:', { error: error.message });
        process.exit(1);
    }
}

// Start the server
startServer();
