# 🐳 Docker Deployment Guide

This guide provides comprehensive Docker configurations for various deployment scenarios including GitHub Codespaces, local development, and production environments.

## 📋 Available Docker Configurations

### 1. **Codespaces Environment** (Recommended for GitHub Codespaces)
- **File**: `Dockerfile.codespaces` + `docker-compose.codespaces.yml`
- **Purpose**: Full development environment optimized for GitHub Codespaces
- **Features**: Hot reload, all development tools, Redis, complete environment

```bash
# Start Codespaces environment
docker-compose -f docker-compose.codespaces.yml up

# With additional services (Redis GUI)
docker-compose -f docker-compose.codespaces.yml --profile with-gui up
```

### 2. **Simple Development** (Quick local development)
- **File**: `Dockerfile.dev` + `docker-compose.dev.yml`
- **Purpose**: Lightweight development environment
- **Features**: Basic setup, hot reload, minimal footprint

```bash
# Start simple development environment
docker-compose -f docker-compose.dev.yml up
```

### 3. **MCP-Only Production** (Backend only)
- **File**: `Dockerfile.mcp-only` + `docker-compose.mcp-only.yml`
- **Purpose**: Production backend-only deployment
- **Features**: API Gateway + MCP Server, Redis, Nginx, health checks

```bash
# Start MCP-only production environment
docker-compose -f docker-compose.mcp-only.yml up

# With Nginx proxy
docker-compose -f docker-compose.mcp-only.yml --profile with-proxy up
```

### 4. **Individual Services**
- **Backend**: `backend/Dockerfile`
- **Frontend**: `frontend/modern/lz-labs-main/web-chat/Dockerfile`

## 🚀 Quick Start Commands

### For GitHub Codespaces
```bash
# Automatic setup with devcontainer
# Simply open in Codespaces - everything is configured automatically!

# Manual Docker approach
docker-compose -f docker-compose.codespaces.yml up -d
```

### For Local Development
```bash
# Simple development
docker-compose -f docker-compose.dev.yml up

# Full Codespaces-like environment locally
docker-compose -f docker-compose.codespaces.yml up
```

### For Production (Backend only)
```bash
# MCP-only deployment
docker-compose -f docker-compose.mcp-only.yml up -d

# With health monitoring
docker-compose -f docker-compose.mcp-only.yml up -d && \
docker-compose -f docker-compose.mcp-only.yml logs -f
```

## 🔧 Environment Configuration

All Docker configurations support environment variables:

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### Required Environment Variables
```env
# Basic setup (demo values work for testing)
NOTION_TOKEN=demo
NOTION_DATABASE_ID=demo
NOTION_CHARACTERS_DB_ID=demo
NOTION_SCENES_DB_ID=demo
NOTION_LOCATIONS_DB_ID=demo

# Ports (defaults shown)
GATEWAY_PORT=3001
WEB_PORT=3002
MCP_PORT=8080
```

## 🌐 Service URLs

### Codespaces & Development
- **Web Interface**: http://localhost:3002
- **API Gateway**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Writer API**: http://localhost:3001/api/v1/writer
- **MCP Server**: Direct connection on port 8080
- **Redis**: localhost:6379
- **Redis GUI**: http://localhost:8081 (with `--profile with-gui`)

### Production (MCP-Only)
- **API Gateway**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Writer API**: http://localhost:3001/api/v1/writer
- **MCP Server**: Direct connection on port 8080

## 📊 Health Monitoring

All configurations include health checks:

```bash
# Check container health
docker ps

# View health status
docker inspect [container-name] | grep -A 20 '"Health"'

# Check service health via API
curl http://localhost:3001/health
```

## 🔨 Development Features

### Hot Reload Support
All development configurations support hot reload:
- **Backend**: Automatic TypeScript compilation and restart
- **Frontend**: Vite hot module replacement
- **Configuration**: Live reload of environment changes

### Volume Mounts
Development containers mount source code for real-time editing:
```yaml
volumes:
  - .:/workspace  # Full source code
  - /workspace/node_modules  # Preserve node_modules
```

### Development Tools Included
- Node.js 20+ with npm
- TypeScript & ts-node
- Nodemon for auto-restart
- Git & development utilities
- Redis for caching
- Health monitoring scripts

## 🐳 Docker Management Scripts

### Build and Start
```bash
# Build and start any configuration
docker-compose -f [config-file] up --build

# Run in detached mode
docker-compose -f [config-file] up -d

# View logs
docker-compose -f [config-file] logs -f
```

### Stop and Clean
```bash
# Stop services
docker-compose -f [config-file] down

# Stop and remove volumes
docker-compose -f [config-file] down -v

# Clean up everything
docker system prune -a
```

### Debugging
```bash
# Execute commands in running container
docker exec -it [container-name] bash

# View container logs
docker logs [container-name] -f

# Inspect container configuration
docker inspect [container-name]
```

## 🚀 GitHub Codespaces Setup

### Automatic Setup (Recommended)
1. Open repository in GitHub Codespaces
2. Devcontainer automatically configures everything
3. Run `npm run dev` to start all services
4. Access services through forwarded ports

### Manual Setup
1. Open repository in GitHub Codespaces
2. Run: `docker-compose -f docker-compose.codespaces.yml up -d`
3. Services will be available on forwarded ports

### Codespaces Features
- **Automatic port forwarding**: All service ports automatically forwarded
- **VS Code extensions**: Pre-configured with TypeScript, Docker, AI tools
- **Development tools**: Git, Docker, Node.js tools pre-installed
- **Hot reload**: Full hot reload support for development
- **Health monitoring**: Built-in health checks and monitoring

## 🔒 Security Considerations

### Development Environments
- Use demo/test credentials only
- Don't expose sensitive ports publicly
- Regular security updates included

### Production Environments
- Use strong credentials
- Configure proper firewall rules
- Enable TLS/SSL for public access
- Regular security monitoring

## 🆘 Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check port usage
lsof -i :3001

# Use different ports
GATEWAY_PORT=3101 docker-compose -f [config] up
```

**Container won't start:**
```bash
# Check logs
docker logs [container-name]

# Rebuild container
docker-compose -f [config] up --build --force-recreate
```

**Environment variables not loading:**
```bash
# Verify .env file exists
ls -la .env

# Check environment in container
docker exec [container] env | grep NOTION
```

### Getting Help
```bash
# Check service status
npm run status-mcp

# Run health checks
curl http://localhost:3001/health

# View all containers
docker ps -a
```

## 📚 Additional Resources

- [MCP Deployment Guide](./MCP-DEPLOYMENT.md)
- [Quick Start Guide](./QUICK-START.md)
- [GitHub Codespaces Documentation](https://docs.github.com/en/codespaces)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

**Note**: All Docker configurations are designed to work out-of-the-box with demo credentials for immediate testing and development.