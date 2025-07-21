# SSH Docker Testing Setup

## Project Overview

This Electron application is designed for remote server management and log monitoring. The app allows users to connect to remote servers via SSH, 
execute commands, and manage server operations from a centralized desktop interface. Future plans include Docker container integration for enhanced server 
orchestration capabilities.

## Quick Start

This project uses a Docker container to test SSH connections locally without needing external servers during development.

### Prerequisites
- Docker Desktop installed and running
- Docker container: `rastasheep/ubuntu-sshd:18.04`

### Setup Commands

```bash
# Run SSH server container
docker run -d \
  --name ssh-test \
  -p 2222:22 \
  -e SSH_ENABLE_PASSWORD_AUTH=true \
  rastasheep/ubuntu-sshd:18.04
```

### Connection Details

- **Host:** `localhost`
- **Port:** `2222`
- **Username:** `root`
- **Password:** `root`

### Testing Connection

You can test the SSH connection manually before using the app:

```bash
ssh root@localhost -p 2222
# Password: root
```

### App Configuration

Use these values in your application's SSH form:
- Host: `localhost`
- Port: `2222`
- Username: `root`
- Password: `root`
- Command: Any Linux command (e.g., `ls`, `whoami`, `pwd`)

### Container Management

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

### Troubleshooting

1. **Connection Refused**: Make sure Docker Desktop is running and container is active
2. **Authentication Failed**: Double-check credentials are exactly `root/root`
3. **Port Issues**: Ensure no other service is using port 2222

### Alternative Setup (More Customizable)

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
