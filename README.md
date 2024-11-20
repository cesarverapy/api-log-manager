# API Log Manager

API Log Manager is a centralized logging solution designed for distributed API services. It enables efficient collection, management, and analysis of log data across multiple services in real-time.

## Features
- **Centralized Logging**: Aggregate logs from multiple API services.
- **Real-time Monitoring**: Monitor API logs for errors, performance, and activity in real-time.
- **JSON Log Storage**: Logs are stored in a structured format (`logs.json`) for easy parsing.
- **Scalable Design**: Supports logging for multiple services (`service1.js`, `service2.js`).
- **Extensible**: Can be integrated with other monitoring or analytics tools.

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm (v6+)

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/api-log-manager.git
   ```
2. Navigate to the project directory:
   ```bash
   cd api-log-manager
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Usage
1. Start the central logging server:
   ```bash
   node centralLoggingServer.js
   ```
2. Simulate logs from services:
   ```bash
   node service1.js
   node service2.js
   ```
3. View logs in `logs.json`.

### Project Structure
- `centralLoggingServer.js`: Core logging server that aggregates logs from services.
- `service1.js` & `service2.js`: Simulated API services generating logs.
- `logs.json`: Stores all the logs in JSON format.
- `package.json`: Contains dependencies and scripts.

## Future Enhancements
- Add visualization for logs in a dashboard.
- Integrate alert notifications for critical errors.
- Support for log rotation and archival.
