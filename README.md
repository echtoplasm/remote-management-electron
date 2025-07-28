# SSH Docker Testing Setup

## Project Overview
This Electron application is designed for remote server management and log monitoring. The app allows users to connect to remote servers via SSH, 
execute commands, and manage server operations from a centralized desktop interface. The application now includes real-time WebSocket communication 
for live server updates and monitoring. Future plans include Docker container integration for enhanced server orchestration capabilities.

## Features
- **SSH Connection Management**: Connect to remote servers and execute commands
- **Real-time WebSocket Communication**: Live server updates and bidirectional messaging
- **Docker Integration**: Local testing environment for development
- **Cross-platform Desktop Interface**: Built with Electron for Windows, macOS, and Linux

## Quick Start
This project uses Docker containers to test both SSH connections and WebSocket communication locally without needing external servers during development.

### Prerequisites
- Docker Desktop installed and running
- Node.js and npm installed
- Electron application dependencies

### Development Setup

#### SSH Testing Container
```bash
# Run SSH server container
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
# Run WebSocket echo server for testing
docker run -p 8080:8080 jmalloc/echo-server
```

**WebSocket Server Details:**
- **URL:** `ws://localhost:8080`
- **Functionality:** Simple echo server that reflects back any messages sent to it
- **Features:** WebSocket echo functionality, HTTP echo capabilities

### Testing Connections

#### SSH Connection Test
```bash
ssh root@localhost -p 2222
# Password: root
```

#### WebSocket Connection Test
Use the application's built-in test function or test manually:
```javascript
// In DevTools console
window.electronAPI.webSocketConnect('Hello WebSocket!');
```

### App Configuration

#### SSH Settings
Use these values in your application's SSH form:
- Host: `localhost`
- Port: `2222`
- Username: `root`
- Password: `root`
- Command: Any Linux command (e.g., `ls`, `whoami`, `pwd`)

#### WebSocket Settings
- Server URL: `ws://localhost:8080`
- Protocol: WebSocket (ws://)
- Features: Real-time messaging, connection status monitoring

### Container Management

#### SSH Container
```bash
# Check if container is running
docker ps

# Stop the container
docker stop ssh-test

# Start existing container
docker start ssh-test

# Remove container (when done testing)
docker stop ssh-test && docker rm ssh-test
```

#### WebSocket Container
```bash
# Check running containers
docker ps

# Stop WebSocket server
docker stop <container_name>

# Start the echo server again
docker run -p 8080:8080 jmalloc/echo-server
```

### Application Architecture

#### IPC Communication
- **SSH Handler**: `ssh-connect-and-execute` - Handles SSH connections and command execution
- **WebSocket Handler**: `webSocketCommunication` - Manages WebSocket connections and real-time messaging
- **System Info**: `get-system-info` and `get-current-load` - System monitoring capabilities

#### Security Features
- Context isolation enabled
- Node integration disabled in renderer
- Secure IPC communication via context bridge

### Troubleshooting

#### SSH Issues
1. **Connection Refused**: Make sure Docker Desktop is running and SSH container is active
2. **Authentication Failed**: Double-check credentials are exactly `root/root`
3. **Port Issues**: Ensure no other service is using port 2222

#### WebSocket Issues
1. **Connection Failed**: Verify WebSocket server container is running on port 8080
2. **No Messages**: Check browser DevTools console for error messages
3. **Port Conflicts**: Ensure port 8080 is available

#### General Issues
1. **Docker Not Running**: Start Docker Desktop
2. **Container Not Found**: Recreate containers using the setup commands above
3. **Permission Issues**: Run Docker commands with appropriate permissions

### Development Testing

#### Built-in Test Functions
The application includes test functions for validating functionality:

```javascript
// WebSocket test (in renderer.js)
const testWebSockets = async () => {
    try {
        const result = await window.electronAPI.webSocketConnect('test data');
        console.log('WebSocket result:', result);
    } catch(err) {
        console.error('WebSocket error:', err.message);
    }
}
```

### Alternative Setup (More Customizable)

#### Alternative SSH Server
```bash
docker run -d \
  --name ssh-server \
  -p 2222:22 \
  -e PUID=1000 \
  -e PGID=1000 \
  -e PASSWORD_ACCESS=true \
  -e USER_PASSWORD=testpass \
  -e USER_NAME=testuser \
  linuxserver/openssh-server
# Credentials: testuser/testpass
```

#### Custom WebSocket Server
For more advanced testing, you can create a custom WebSocket server with specific features for your use case.

### Next Steps
- Enhanced error handling for WebSocket connections
- WebSocket reconnection logic
- Integration of SSH and WebSocket for real-time command output
- Docker container orchestration features
- Advanced logging and monitoring capabilities
