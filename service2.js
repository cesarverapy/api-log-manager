const axios = require('axios');

// Configuration
const config = {
    serverUrl: process.env.LOG_SERVER_URL || 'http://localhost:5001/logs',
    serviceName: 'Service2',
    authToken: 'service2_token',
    retryAttempts: 3,
    retryDelay: 1000,
    portRange: {
        start: 5001,
        end: 5010
    }
};

// Headers configuration
const headers = {
    Authorization: `Bearer ${config.authToken}`,
    'Content-Type': 'application/json'
};

// Function to find the server port
async function findServerPort() {
    for (let port = config.portRange.start; port <= config.portRange.end; port++) {
        try {
            const url = `http://localhost:${port}/health`;
            const response = await axios.get(url, { timeout: 1000 });
            if (response.data.status === 'healthy') {
                return port;
            }
        } catch (error) {
            continue;
        }
    }
    throw new Error('Could not find running server in port range');
}

// Function to send log with retry mechanism
async function sendLog(logData, attempt = 1) {
    try {
        const port = await findServerPort();
        const response = await axios.post(`http://localhost:${port}/logs`, logData, { 
            headers,
            timeout: 5000
        });
        console.log(`Log sent successfully to port ${port}: ${response.status} - ${response.data.message}`);
        return response.data;
    } catch (error) {
        if (attempt < config.retryAttempts) {
            console.warn(`Attempt ${attempt} failed. Retrying in ${config.retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, config.retryDelay));
            return sendLog(logData, attempt + 1);
        }
        throw error;
    }
}

// Function to generate log data
function generateLogData(level, message) {
    return {
        timestamp: new Date().toISOString(),
        service_name: config.serviceName,
        log_level: level,
        message: message
    };
}

// Example usage
async function main() {
    try {
        await sendLog(generateLogData('INFO', 'Service2 started successfully'));
        
        await sendLog(generateLogData('ERROR', 'Database connection failed'));
        
        await sendLog(generateLogData('WARNING', 'High memory usage detected'));
        
    } catch (error) {
        console.error('Failed to send logs:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

main();
