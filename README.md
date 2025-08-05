# SSH Docker Management Platform

## Project Overview
This Electron application is a comprehensive remote server management and container orchestration platform. The app provides a centralized desktop interface for managing SSH connections, Docker containers, and server operations across multiple remote hosts. Built with a modular architecture featuring separated business logic, IPC communication layers, and persistent data storage via SQLite.

## Features
- **SSH Connection Management**: Secure connections with credential storage and tunneling capabilities
- **SSH Tunnel Creation**: Local port forwarding through SSH for secure remote access
- **Real-time WebSocket Communication**: Live server updates and bidirectional messaging through SSH tunnels
- **Docker Container Management**: Remote Docker operations and container lifecycle management
- **System Information Monitoring**: Real-time CPU, memory, and system load monitoring
- **Persistent Credential Storage**: SQLite database for secure credential and server configuration management
- **Cross-platform Desktop Interface**: Built with Electron for Windows, macOS, and Linux

## Architecture

### Project Structure
```
src/
├── main/
│   ├── main.js              # Application entry point and window management
│   ├── services/
│   │   ├── sshManager.js    # SSH operations and tunnel management
│   │   ├── dbManager.js     # SQLite database operations
│   │   └── localSysInfo.js  # System information gathering
│   └── ipc/
│       └── handlers.js      # IPC route definitions and setup
├── preload/
│   └── preload.js          # Secure context bridge for renderer communication
└── renderer/
    ├── js/
    ├── css/
    └── index.html          # Frontend interface
```

### Database Schema
The application uses SQLite for persistent data storage:

- **users**: User profile information
- **ssh_credentials**: SSH connection credentials and configurations
- **remote_servers**: Remote server inventory and metadata
- **docker_containers**: Container tracking and status
- **container_logs**: Container log history and monitoring data

### IPC Communication Layer
Modular IPC handlers provide clean separation between frontend and backend:

- **System Info**: `getSystemInfo`, `getCurrentLoad` - Local system monitoring
- **SSH Operations**: `sshUserExec`, `spawnSSHtunnel` - Remote command execution and tunneling
- **WebSocket Communication**: `webSocketComm` - Real-time messaging through tunnels
- **Docker Management**: `dockerVersion` - Container operations and health checks

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Node.js (v16+) and npm installed
- SQLite (handled automatically by better-sqlite3)

### Environment Configuration
Create a `.env` file in the project root:
```bash
SSH_PASSWORD=your_ssh_password
SSH_HOST=your_remote_host
SSH_USER=your_ssh_username
LOCAL_PORT=8080
REMOTE_PORT=3306
```

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd os-spec

# Install dependencies
npm install

# Install additional dependencies
npm install better-sqlite3 dotenv ws ssh2

# Start the application
npm start
```

### Development Setup

#### SSH Testing Container
```bash
# Run SSH server container for local testing
docker run -d \
  --name ssh-test \
  -p 2222:22 \
  -e SSH_ENABLE_PASSWORD_AUTH=true \
  rastasheep/ubuntu-sshd:18.04
```

**Connection Details:**
- **Host:** `localhost`
- **Port:** `2222`
- **Username:** `root`
- **Password:** `root`

#### WebSocket Testing Server
```bash
# Run WebSocket echo server for tunnel testing
docker run -p 8080:8080 jmalloc/echo-server
```

### Application Configuration

#### Database Initialization
The SQLite database is automatically created on first run in the user data directory:
- **Linux**: `~/.config/os-spec/ssh-credentials.db`
- **macOS**: `~/Library/Application Support/os-spec/ssh-credentials.db`
- **Windows**: `%APPDATA%/os-spec/ssh-credentials.db`

#### SSH Configuration Management
Store and manage multiple SSH configurations:
```javascript
// Save SSH credentials
await window.electronAPI.saveCredentials({
    name: 'production-server',
    host: '192.168.1.100',
    username: 'admin',
    password: 'secure_password',
    port: 22
});
```

#### SSH Tunnel Creation
Create secure tunnels for remote access:
```javascript
// Create SSH tunnel
const tunnel = await window.electronAPI.spawnSSHtunnel(
    8080,    // Local port
    3306,    // Remote port (e.g., MySQL)
    'root',  // SSH username
    '192.168.1.100',  // Remote host
    'password'        // SSH password
);
```

### API Reference

#### System Information
```javascript
// Get system specifications
const sysInfo = await window.electronAPI.getSystemInfo();

// Get current CPU/memory load
const currentLoad = await window.electronAPI.getCurrentLoad();
```

#### SSH Operations
```javascript
// Execute remote SSH command
const result = await window.electronAPI.sshConnectExec(
    { host: 'server.com', username: 'user', password: 'pass', port: 22 },
    'docker ps -a'
);

// Create SSH tunnel
const tunnel = await window.electronAPI.spawnSSHtunnel(8080, 3306, 'root', 'server.com', 'password');
```

#### WebSocket Communication
```javascript
// Send data through WebSocket tunnel
const response = await window.electronAPI.webSocketConnect({
    message: 'container_status_request',
    container_id: 'web-server-01'
});
```

#### Docker Management
```javascript
// Check Docker version on remote server
const dockerInfo = await window.electronAPI.dockerCheck();
```

### Security Features

#### Credential Management
- Environment variable support for sensitive data
- SQLite database encryption for stored credentials
- No hardcoded passwords in source code
- Secure IPC communication via context bridge

#### Electron Security
- Context isolation enabled
- Node integration disabled in renderer process
- Secure preload script implementation
- Content Security Policy enforcement

### Testing

#### Local Development Testing
```javascript
// Test SSH connection
const testSSH = async () => {
    const result = await window.electronAPI.sshConnectExec(
        { host: 'localhost', username: 'root', password: 'root', port: 2222 },
        'whoami'
    );
    console.log('SSH Test Result:', result);
};

// Test WebSocket tunnel
const testWebSocket = async () => {
    const result = await window.electronAPI.webSocketConnect('Hello WebSocket!');
    console.log('WebSocket Test Result:', result);
};

// Test Docker integration
const testDocker = async () => {
    const result = await window.electronAPI.dockerCheck();
    console.log('Docker Version:', result);
};
```

### Container Management

#### SSH Container Operations
```bash
# Container lifecycle management
docker ps                    # Check running containers
docker stop ssh-test        # Stop SSH test container
docker start ssh-test       # Start existing container
docker logs ssh-test        # View container logs
docker rm ssh-test          # Remove container
```

#### WebSocket Server Management
```bash
# WebSocket server operations
docker run -d --name ws-server -p 8080:8080 jmalloc/echo-server
docker stop ws-server
docker start ws-server
```

### Troubleshooting

#### Database Issues
1. **Database Creation Failed**: Check write permissions in user data directory
2. **Migration Errors**: Verify SQLite syntax and foreign key constraints
3. **Connection Issues**: Ensure better-sqlite3 is properly installed

#### SSH Connection Issues
1. **Authentication Failed**: Verify credentials in database or .env file
2. **Tunnel Creation Failed**: Check local port availability and remote connectivity
3. **Command Execution Timeout**: Increase timeout values in SSH service

#### WebSocket Issues
1. **Connection Through Tunnel Failed**: Verify SSH tunnel is established first
2. **Message Not Received**: Check WebSocket server status and tunnel connectivity
3. **Timeout Errors**: Adjust WebSocket timeout configuration

#### Docker Integration Issues
1. **Docker Commands Failed**: Verify Docker is installed on remote server
2. **Permission Denied**: Check SSH user has Docker permissions
3. **Version Mismatch**: Ensure Docker API compatibility

### Development Workflow

#### Adding New Features
1. Create service functions in appropriate service module
2. Add IPC handlers in `ipc/handlers.js`
3. Expose functions in `preload/preload.js`
4. Update database schema if needed
5. Add frontend integration in renderer

#### Database Schema Updates
```javascript
// Example: Adding new table
const initDB = () => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS new_feature (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
};
```

### Future Roadmap
- **Multi-server Dashboard**: Centralized monitoring for multiple servers
- **Container Orchestration**: Docker Compose and Kubernetes integration
- **Log Aggregation**: Centralized logging from multiple sources
- **Performance Monitoring**: Advanced metrics and alerting
- **Backup Management**: Automated backup and recovery workflows
- **User Authentication**: Multi-user support with role-based access control
- **CVE Analysis**: Comparing docker and remote server dependencies against an external CVE database, and generating fitting reports.

### Contributing
This project follows a modular architecture pattern. When contributing:
1. Keep business logic in service modules
2. Use IPC handlers only for routing
3. Follow SQLite best practices for database operations
4. Maintain security practices for credential handling
5. Add comprehensive error handling and logging

