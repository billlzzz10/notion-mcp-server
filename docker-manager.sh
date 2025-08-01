#!/bin/bash

# ===========================================
# Docker Management Script for Notion MCP Server
# ===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="notion-mcp-server"

# Print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Show usage
show_usage() {
    echo -e "${BLUE}🐳 Docker Management for Notion MCP Server${NC}"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  codespaces         Start Codespaces development environment"
    echo "  dev                Start simple development environment"
    echo "  mcp                Start MCP-only production environment"
    echo "  build [ENV]        Build specific environment (codespaces|dev|mcp)"
    echo "  stop [ENV]         Stop specific environment"
    echo "  logs [ENV]         View logs for environment"
    echo "  clean              Clean up all Docker resources"
    echo "  status             Show status of all containers"
    echo "  health             Check health of all services"
    echo ""
    echo "Options:"
    echo "  --detach, -d       Run in detached mode"
    echo "  --build            Force rebuild containers"
    echo "  --with-gui         Include additional GUI services (Codespaces only)"
    echo "  --with-proxy       Include Nginx proxy"
    echo ""
    echo "Examples:"
    echo "  $0 codespaces --detach        # Start Codespaces environment in background"
    echo "  $0 dev --build                # Rebuild and start dev environment"
    echo "  $0 mcp --with-proxy          # Start MCP with Nginx proxy"
    echo "  $0 logs codespaces           # View Codespaces logs"
    echo "  $0 clean                     # Clean up everything"
}

# Start Codespaces environment
start_codespaces() {
    local compose_file="docker-compose.codespaces.yml"
    local profiles=""
    local docker_args=""
    
    if [[ "$*" == *"--with-gui"* ]]; then
        profiles="--profile with-gui"
    fi
    
    if [[ "$*" == *"--detach"* ]] || [[ "$*" == *"-d"* ]]; then
        docker_args="-d"
    fi
    
    if [[ "$*" == *"--build"* ]]; then
        docker_args="$docker_args --build"
    fi
    
    print_info "Starting Codespaces development environment..."
    docker-compose -f $compose_file $profiles up $docker_args
    
    if [[ "$docker_args" == *"-d"* ]]; then
        print_success "Codespaces environment started in detached mode"
        print_info "Web Interface: http://localhost:3002"
        print_info "API Gateway: http://localhost:3001"
        print_info "Health Check: http://localhost:3001/health"
        print_info "Redis GUI: http://localhost:8081 (with --with-gui)"
    fi
}

# Start development environment
start_dev() {
    local compose_file="docker-compose.dev.yml"
    local docker_args=""
    
    if [[ "$*" == *"--detach"* ]] || [[ "$*" == *"-d"* ]]; then
        docker_args="-d"
    fi
    
    if [[ "$*" == *"--build"* ]]; then
        docker_args="$docker_args --build"
    fi
    
    print_info "Starting simple development environment..."
    docker-compose -f $compose_file up $docker_args
    
    if [[ "$docker_args" == *"-d"* ]]; then
        print_success "Development environment started in detached mode"
        print_info "Web Interface: http://localhost:3002"
        print_info "API Gateway: http://localhost:3001"
        print_info "Health Check: http://localhost:3001/health"
    fi
}

# Start MCP-only environment
start_mcp() {
    local compose_file="docker-compose.mcp-only.yml"
    local profiles=""
    local docker_args=""
    
    if [[ "$*" == *"--with-proxy"* ]]; then
        profiles="--profile with-proxy"
    fi
    
    if [[ "$*" == *"--detach"* ]] || [[ "$*" == *"-d"* ]]; then
        docker_args="-d"
    fi
    
    if [[ "$*" == *"--build"* ]]; then
        docker_args="$docker_args --build"
    fi
    
    print_info "Starting MCP-only production environment..."
    docker-compose -f $compose_file $profiles up $docker_args
    
    if [[ "$docker_args" == *"-d"* ]]; then
        print_success "MCP-only environment started in detached mode"
        print_info "API Gateway: http://localhost:3001"
        print_info "Health Check: http://localhost:3001/health"
        print_info "Writer API: http://localhost:3001/api/v1/writer"
        if [[ "$*" == *"--with-proxy"* ]]; then
            print_info "Nginx Proxy: http://localhost:80"
        fi
    fi
}

# Build specific environment
build_env() {
    local env="$1"
    case $env in
        codespaces)
            print_info "Building Codespaces environment..."
            docker-compose -f docker-compose.codespaces.yml build
            ;;
        dev)
            print_info "Building development environment..."
            docker-compose -f docker-compose.dev.yml build
            ;;
        mcp)
            print_info "Building MCP-only environment..."
            docker-compose -f docker-compose.mcp-only.yml build
            ;;
        *)
            print_error "Unknown environment: $env"
            print_info "Available environments: codespaces, dev, mcp"
            exit 1
            ;;
    esac
    print_success "Build completed for $env environment"
}

# Stop specific environment
stop_env() {
    local env="$1"
    case $env in
        codespaces)
            print_info "Stopping Codespaces environment..."
            docker-compose -f docker-compose.codespaces.yml down
            ;;
        dev)
            print_info "Stopping development environment..."
            docker-compose -f docker-compose.dev.yml down
            ;;
        mcp)
            print_info "Stopping MCP-only environment..."
            docker-compose -f docker-compose.mcp-only.yml down
            ;;
        *)
            print_error "Unknown environment: $env"
            print_info "Available environments: codespaces, dev, mcp"
            exit 1
            ;;
    esac
    print_success "Stopped $env environment"
}

# View logs for specific environment
view_logs() {
    local env="$1"
    case $env in
        codespaces)
            docker-compose -f docker-compose.codespaces.yml logs -f
            ;;
        dev)
            docker-compose -f docker-compose.dev.yml logs -f
            ;;
        mcp)
            docker-compose -f docker-compose.mcp-only.yml logs -f
            ;;
        *)
            print_error "Unknown environment: $env"
            print_info "Available environments: codespaces, dev, mcp"
            exit 1
            ;;
    esac
}

# Clean up Docker resources
clean_docker() {
    print_warning "This will remove all containers, networks, and volumes for this project"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Stopping all environments..."
        docker-compose -f docker-compose.codespaces.yml down -v --remove-orphans 2>/dev/null || true
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans 2>/dev/null || true
        docker-compose -f docker-compose.mcp-only.yml down -v --remove-orphans 2>/dev/null || true
        
        print_info "Removing project images..."
        docker images | grep "$PROJECT_NAME" | awk '{print $3}' | xargs -r docker rmi -f
        
        print_info "Cleaning up unused resources..."
        docker system prune -f
        
        print_success "Docker cleanup completed"
    else
        print_info "Cleanup cancelled"
    fi
}

# Show container status
show_status() {
    print_info "Docker container status:"
    echo ""
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(NAMES|notion|redis)" || print_warning "No containers found"
    echo ""
    
    print_info "Docker images:"
    echo ""
    docker images | grep -E "(REPOSITORY|notion|redis)" || print_warning "No images found"
}

# Check health of all services
check_health() {
    print_info "Checking service health..."
    echo ""
    
    # Check if any containers are running
    if ! docker ps | grep -q "notion"; then
        print_warning "No Notion MCP containers are running"
        return
    fi
    
    # Check API Gateway health
    if curl -s http://localhost:3001/health >/dev/null 2>&1; then
        print_success "API Gateway: Healthy (http://localhost:3001)"
    else
        print_error "API Gateway: Unhealthy or not accessible"
    fi
    
    # Check Web Interface
    if curl -s http://localhost:3002 >/dev/null 2>&1; then
        print_success "Web Interface: Accessible (http://localhost:3002)"
    else
        print_warning "Web Interface: Not accessible (may be normal for MCP-only)"
    fi
    
    # Check Redis
    if docker ps | grep -q "redis"; then
        if nc -z localhost 6379 2>/dev/null; then
            print_success "Redis: Connected (localhost:6379)"
        else
            print_error "Redis: Connection failed"
        fi
    else
        print_info "Redis: Not running"
    fi
    
    # Check MCP Server
    if nc -z localhost 8080 2>/dev/null; then
        print_success "MCP Server: Listening (localhost:8080)"
    else
        print_warning "MCP Server: Not accessible on port 8080"
    fi
}

# Main script logic
case "${1:-help}" in
    codespaces)
        start_codespaces "${@:2}"
        ;;
    dev)
        start_dev "${@:2}"
        ;;
    mcp)
        start_mcp "${@:2}"
        ;;
    build)
        if [ -z "$2" ]; then
            print_error "Please specify environment to build (codespaces|dev|mcp)"
            exit 1
        fi
        build_env "$2"
        ;;
    stop)
        if [ -z "$2" ]; then
            print_error "Please specify environment to stop (codespaces|dev|mcp)"
            exit 1
        fi
        stop_env "$2"
        ;;
    logs)
        if [ -z "$2" ]; then
            print_error "Please specify environment for logs (codespaces|dev|mcp)"
            exit 1
        fi
        view_logs "$2"
        ;;
    clean)
        clean_docker
        ;;
    status)
        show_status
        ;;
    health)
        check_health
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac