# API Log Manager

A production-ready centralized logging solution for distributed API services. This system enables efficient collection, management, and analysis of log data across multiple services in real-time.

## Features
- **Centralized Logging**: Aggregate logs from multiple API services
- **Real-time Monitoring**: Monitor API logs for errors, performance, and activity
- **JSON Log Storage**: Structured log storage with rotation
- **Security**: Token-based authentication and rate limiting
- **Production Ready**: Includes error handling, logging, and monitoring
- **Scalable**: Supports multiple services with configurable settings

## Prerequisites
- Node.js >= 14.0.0
- npm >= 6.0.0

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/api-log-manager.git
cd api-log-manager
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment configuration:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`

## Development

Start the development server:
```bash
npm run start:dev
```

Run the example services:
```bash
npm run service1
npm run service2
```

## Production Deployment

1. Set up environment variables:
```bash
export NODE_ENV=production
export PORT=5001
export AUTH_TOKENS=your_service1_token,your_service2_token
```

2. Start the production server:
```bash
npm run start:prod
```

### Using PM2 (Recommended for Production)

1. Install PM2 globally:
```bash
npm install -g pm2
```

2. Start the server with PM2:
```bash
pm2 start centralLoggingServer.js --name "api-log-manager"
```

3. Configure PM2 to start on system reboot:
```bash
pm2 startup
pm2 save
```

## API Endpoints

- `POST /logs`: Submit a new log entry
- `GET /logs`: Retrieve all logs
- `GET /health`: Health check endpoint
- `GET /metrics`: System metrics

## Security

- All requests require authentication via Bearer token
- Rate limiting is enabled (100 requests per 15 minutes per IP)
- Helmet.js security headers are enabled
- Compression is enabled for responses

## Logging

- Server logs are stored in `logs/server.log`
- API logs are stored in `logs/api-logs.json`
- Log rotation is enabled (configurable size and number of files)
- Winston logger is used for structured logging

## Monitoring

The system provides several monitoring endpoints:
- `/health`: Basic health check
- `/metrics`: System metrics including uptime and log file statistics

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5001 |
| LOG_LEVEL | Logging level | info |
| MAX_LOG_SIZE | Maximum log file size | 1000000 |
| MAX_LOG_FILES | Number of rotated log files | 5 |
| AUTH_TOKENS | Comma-separated list of valid tokens | - |
| RATE_LIMIT_WINDOW_MS | Rate limit window | 900000 |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | 100 |

## Best Practices

1. **Security**:
   - Use strong, unique tokens for each service
   - Regularly rotate authentication tokens
   - Monitor for unauthorized access attempts

2. **Performance**:
   - Monitor log file sizes
   - Adjust rate limits based on expected load
   - Use compression for large log entries

3. **Maintenance**:
   - Regularly backup log files
   - Monitor disk space usage
   - Review and clean old logs periodically

## License

ISC
