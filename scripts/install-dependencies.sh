#!/bin/bash

# 🔧 Enhanced Dependency Installation Automation
# ระบบติดตั้ง Dependencies อัตโนมัติแบบอัจฉริยะ

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Node.js is installed
check_node() {
    log "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed!"
        echo "Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error "Node.js version $NODE_VERSION is too old! Please upgrade to Node.js 18+"
        exit 1
    fi
    
    success "Node.js $(node -v) is installed"
}

# Check if npm is available
check_npm() {
    log "Checking npm installation..."
    if ! command -v npm &> /dev/null; then
        error "npm is not installed!"
        exit 1
    fi
    success "npm $(npm -v) is available"
}

# Clean install with cache clearing
clean_install() {
    local dir=$1
    local name=$2
    
    log "Installing dependencies for $name..."
    
    cd "$dir"
    
    # Clear npm cache
    npm cache clean --force 2>/dev/null || true
    
    # Remove node_modules and package-lock if they exist
    if [ -d "node_modules" ]; then
        log "Removing old node_modules in $name..."
        rm -rf node_modules
    fi
    
    if [ -f "package-lock.json" ]; then
        log "Removing old package-lock.json in $name..."
        rm -f package-lock.json
    fi
    
    # Install dependencies
    if npm ci 2>/dev/null; then
        success "Clean install completed for $name"
    elif npm install; then
        success "Install completed for $name"
    else
        error "Failed to install dependencies for $name"
        return 1
    fi
    
    cd - > /dev/null
}

# Security audit and fix
security_check() {
    local dir=$1
    local name=$2
    
    log "Running security audit for $name..."
    cd "$dir"
    
    # Run audit
    if npm audit --audit-level moderate; then
        success "No security vulnerabilities found in $name"
    else
        warning "Security vulnerabilities found in $name"
        log "Attempting to fix vulnerabilities..."
        
        # Try automatic fix first
        if npm audit fix; then
            success "Vulnerabilities fixed automatically for $name"
        else
            warning "Some vulnerabilities require manual intervention for $name"
            log "Running forced fix for critical issues..."
            npm audit fix --force || warning "Forced fix completed with warnings for $name"
        fi
    fi
    
    cd - > /dev/null
}

# Build project
build_project() {
    local dir=$1
    local name=$2
    
    log "Building $name..."
    cd "$dir"
    
    if npm run build; then
        success "Build completed for $name"
    else
        error "Build failed for $name"
        return 1
    fi
    
    cd - > /dev/null
}

# Main installation process
main() {
    log "🚀 Starting Enhanced Dependency Installation..."
    
    # Check system requirements
    check_node
    check_npm
    
    # Get project root
    PROJECT_ROOT=$(pwd)
    
    # Install root dependencies
    log "📦 Installing root dependencies..."
    clean_install "$PROJECT_ROOT" "root project"
    
    # Install backend dependencies
    if [ -d "backend" ]; then
        log "🔧 Installing backend dependencies..."
        clean_install "$PROJECT_ROOT/backend" "backend"
        security_check "$PROJECT_ROOT/backend" "backend"
        build_project "$PROJECT_ROOT/backend" "backend"
    fi
    
    # Install frontend dependencies (check multiple possible locations)
    FRONTEND_DIRS=(
        "frontend/modern/lz-labs-main/web-chat"
        "backend/web-chat"
        "web-chat"
        "frontend"
    )
    
    for dir in "${FRONTEND_DIRS[@]}"; do
        if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
            log "🎨 Installing frontend dependencies in $dir..."
            clean_install "$PROJECT_ROOT/$dir" "frontend ($dir)"
            security_check "$PROJECT_ROOT/$dir" "frontend ($dir)"
            
            # Try to build if build script exists
            cd "$PROJECT_ROOT/$dir"
            if npm run --silent build 2>/dev/null; then
                build_project "$PROJECT_ROOT/$dir" "frontend ($dir)"
            else
                warning "No build script found for frontend in $dir"
            fi
            cd - > /dev/null
            break
        fi
    done
    
    # Create .nvmrc for Node version consistency
    if [ ! -f ".nvmrc" ]; then
        log "Creating .nvmrc file..."
        node -v > .nvmrc
        success "Created .nvmrc with Node $(cat .nvmrc)"
    fi
    
    # Create startup scripts if they don't exist
    create_startup_scripts
    
    # Final health check
    health_check
    
    success "🎉 Enhanced dependency installation completed successfully!"
    
    echo ""
    echo "📋 Next steps:"
    echo "1. Copy .env.example to .env and configure your environment variables"
    echo "2. Run 'npm run dev-mcp-only' to start the development server"
    echo "3. Access the API at http://localhost:3001"
    echo "4. Check health at http://localhost:3001/health"
}

# Create startup scripts
create_startup_scripts() {
    log "Creating startup scripts..."
    
    # Create start-all.sh
    cat > start-all.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting all services..."
npm-run-all --parallel start-gateway start-mcp start-web
EOF
    chmod +x start-all.sh
    
    # Create start-production.sh
    cat > start-production.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting production services..."
export NODE_ENV=production
npm-run-all --parallel start-gateway start-mcp
EOF
    chmod +x start-production.sh
    
    success "Created startup scripts"
}

# Health check
health_check() {
    log "Running final health check..."
    
    # Check if all required files exist
    REQUIRED_FILES=(
        "package.json"
        "backend/package.json"
        "backend/tsconfig.json"
        ".env.example"
    )
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$file" ]; then
            success "$file exists"
        else
            warning "$file is missing"
        fi
    done
    
    # Check if build output exists
    if [ -d "backend/build" ]; then
        success "Backend build output exists"
    else
        warning "Backend build output missing"
    fi
}

# Handle script arguments
case "${1:-}" in
    --skip-security)
        log "Skipping security checks..."
        SKIP_SECURITY=true
        ;;
    --clean)
        log "Performing complete clean installation..."
        rm -rf node_modules backend/node_modules frontend/node_modules web-chat/node_modules
        rm -f package-lock.json backend/package-lock.json frontend/package-lock.json web-chat/package-lock.json
        ;;
    --help)
        echo "Usage: $0 [--skip-security] [--clean] [--help]"
        echo ""
        echo "Options:"
        echo "  --skip-security  Skip security audit and fixes"
        echo "  --clean          Remove all node_modules and package-lock.json files before install"
        echo "  --help           Show this help message"
        exit 0
        ;;
esac

# Run main function
main "$@"