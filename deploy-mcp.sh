#!/bin/bash

# ========================================
# MCP-Only Deployment Script
# ========================================
# ช่วยในการ deploy ระบบ MCP โดยไม่รวม frontend
# รองรับ Docker และ direct deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Configuration
DEPLOYMENT_TYPE=${1:-"docker"}
PORT=${PORT:-3001}
MCP_PORT=${MCP_PORT:-8080}
ENV_FILE=${ENV_FILE:-".env"}

log_info "🚀 Starting MCP-Only Deployment"
log_info "📦 Deployment Type: $DEPLOYMENT_TYPE"
log_info "🌐 Gateway Port: $PORT"
log_info "📡 MCP Port: $MCP_PORT"

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    log_warning "Environment file $ENV_FILE not found"
    if [ -f ".env.example" ]; then
        log_info "Copying .env.example to $ENV_FILE"
        cp .env.example "$ENV_FILE"
        log_warning "Please configure $ENV_FILE with your settings"
    fi
fi

# Docker deployment
deploy_docker() {
    log_info "🐳 Starting Docker deployment..."
    
    # Build Docker image
    log_info "Building MCP-only Docker image..."
    docker build -f Dockerfile.mcp-only -t notion-mcp-server:mcp-only .
    log_success "Docker image built successfully"
    
    # Stop existing container if running
    if docker ps -q -f name=notion-mcp-server-mcp >/dev/null 2>&1; then
        log_info "Stopping existing container..."
        docker stop notion-mcp-server-mcp
        docker rm notion-mcp-server-mcp
    fi
    
    # Run container
    log_info "Starting MCP container..."
    docker run -d \
        --name notion-mcp-server-mcp \
        --env-file "$ENV_FILE" \
        -p $PORT:3001 \
        -p $MCP_PORT:8080 \
        --restart unless-stopped \
        notion-mcp-server:mcp-only
    
    log_success "MCP container started successfully"
    
    # Wait for services to be ready
    log_info "Waiting for services to start..."
    sleep 10
    
    # Health check
    if curl -f http://localhost:$PORT/health >/dev/null 2>&1; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        docker logs notion-mcp-server-mcp --tail 20
        exit 1
    fi
}

# Direct deployment (no Docker)
deploy_direct() {
    log_info "🔧 Starting direct deployment..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js 18+ is required (current: $(node --version))"
        exit 1
    fi
    
    log_success "Node.js version check passed: $(node --version)"
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm install
    cd backend && npm install && cd ..
    log_success "Dependencies installed"
    
    # Build TypeScript
    log_info "Building TypeScript..."
    cd backend && npm run build && cd ..
    log_success "TypeScript build completed"
    
    # Create systemd service (if requested)
    if [ "$CREATE_SERVICE" = "true" ] && command -v systemctl &> /dev/null; then
        create_systemd_service
    fi
    
    # Start services
    log_info "Starting MCP services..."
    
    # Create run directory
    mkdir -p ./run
    
    # Start MCP Server
    log_info "Starting MCP Server on port $MCP_PORT..."
    cd backend && node build/index.js &
    MCP_PID=$!
    echo $MCP_PID > ../run/mcp.pid
    cd ..
    
    # Wait for MCP server to start
    sleep 3
    
    # Start API Gateway
    log_info "Starting API Gateway on port $PORT..."
    GATEWAY_PORT=$PORT node backend/server/app.js &
    GATEWAY_PID=$!
    echo $GATEWAY_PID > ./run/gateway.pid
    
    log_success "Services started successfully"
    log_info "MCP Server PID: $MCP_PID"
    log_info "Gateway PID: $GATEWAY_PID"
    
    # Health check
    sleep 5
    if curl -f http://localhost:$PORT/health >/dev/null 2>&1; then
        log_success "Health check passed"
    else
        log_warning "Health check failed, services may still be starting..."
    fi
}

# Create systemd service
create_systemd_service() {
    log_info "Creating systemd service..."
    
    SERVICE_FILE="/etc/systemd/system/notion-mcp-server.service"
    CURRENT_DIR=$(pwd)
    CURRENT_USER=$(whoami)
    
    sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=Notion MCP Server (Backend Only)
After=network.target

[Service]
Type=forking
User=$CURRENT_USER
WorkingDirectory=$CURRENT_DIR
Environment=NODE_ENV=production
Environment=GATEWAY_PORT=$PORT
Environment=MCP_PORT=$MCP_PORT
EnvironmentFile=$CURRENT_DIR/$ENV_FILE
ExecStart=$CURRENT_DIR/deploy-mcp.sh direct
ExecStop=/bin/kill -TERM \$MAINPID
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    sudo systemctl enable notion-mcp-server
    log_success "Systemd service created and enabled"
}

# Stop function
stop_services() {
    log_info "Stopping MCP services..."
    
    if [ "$DEPLOYMENT_TYPE" = "docker" ]; then
        if docker ps -q -f name=notion-mcp-server-mcp >/dev/null 2>&1; then
            docker stop notion-mcp-server-mcp
            docker rm notion-mcp-server-mcp
            log_success "Docker container stopped"
        else
            log_info "No Docker container running"
        fi
    else
        # Stop direct deployment
        if [ -f ./run/mcp.pid ]; then
            MCP_PID=$(cat ./run/mcp.pid)
            kill $MCP_PID 2>/dev/null || true
            rm ./run/mcp.pid
            log_success "MCP Server stopped"
        fi
        
        if [ -f ./run/gateway.pid ]; then
            GATEWAY_PID=$(cat ./run/gateway.pid)
            kill $GATEWAY_PID 2>/dev/null || true
            rm ./run/gateway.pid
            log_success "Gateway stopped"
        fi
    fi
}

# Status function
check_status() {
    log_info "Checking MCP service status..."
    
    if [ "$DEPLOYMENT_TYPE" = "docker" ]; then
        if docker ps -q -f name=notion-mcp-server-mcp >/dev/null 2>&1; then
            log_success "Docker container is running"
            docker ps -f name=notion-mcp-server-mcp
        else
            log_warning "Docker container is not running"
        fi
    else
        # Check direct deployment
        if [ -f ./run/mcp.pid ] && [ -f ./run/gateway.pid ]; then
            MCP_PID=$(cat ./run/mcp.pid)
            GATEWAY_PID=$(cat ./run/gateway.pid)
            
            if kill -0 $MCP_PID 2>/dev/null && kill -0 $GATEWAY_PID 2>/dev/null; then
                log_success "Services are running"
                log_info "MCP Server PID: $MCP_PID"
                log_info "Gateway PID: $GATEWAY_PID"
            else
                log_warning "Some services are not running"
            fi
        else
            log_warning "Services are not running"
        fi
    fi
    
    # Health check
    if curl -f http://localhost:$PORT/health >/dev/null 2>&1; then
        log_success "Health check passed"
        curl -s http://localhost:$PORT/health | jq . 2>/dev/null || curl -s http://localhost:$PORT/health
    else
        log_error "Health check failed"
    fi
}

# Main script logic
case "${1:-deploy}" in
    "docker")
        deploy_docker
        ;;
    "direct")
        deploy_direct
        ;;
    "stop")
        stop_services
        ;;
    "status")
        check_status
        ;;
    "restart")
        stop_services
        sleep 2
        if [ "$DEPLOYMENT_TYPE" = "docker" ]; then
            deploy_docker
        else
            deploy_direct
        fi
        ;;
    *)
        echo "Usage: $0 {docker|direct|stop|status|restart}"
        echo ""
        echo "Commands:"
        echo "  docker   - Deploy using Docker"
        echo "  direct   - Deploy directly on host"
        echo "  stop     - Stop services"
        echo "  status   - Check service status"
        echo "  restart  - Restart services"
        echo ""
        echo "Environment variables:"
        echo "  PORT           - Gateway port (default: 3001)"
        echo "  MCP_PORT       - MCP server port (default: 8080)"
        echo "  ENV_FILE       - Environment file (default: .env)"
        echo "  CREATE_SERVICE - Create systemd service (default: false)"
        exit 1
        ;;
esac

log_success "🎉 MCP deployment completed!"
log_info "📊 Health Check: http://localhost:$PORT/health"
log_info "🔧 API Gateway: http://localhost:$PORT/api/v1"
log_info "📝 Writer API: http://localhost:$PORT/api/v1/writer"
log_info "🤖 Agent API: http://localhost:$PORT/api/v1/agent"