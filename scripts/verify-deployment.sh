#!/bin/bash

# 🚀 Three-Component Deployment Verification Script
# ตรวจสอบการติดตั้งและใช้งานทั้ง 3 ส่วนหลัก

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

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

info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

section() {
    echo -e "\n${PURPLE}===== $1 =====${NC}"
}

# Deployment status tracking
DEPLOYMENT_STATUS=()

check_deployment_component() {
    local component=$1
    local check_command=$2
    local success_message=$3
    local failure_message=$4
    
    log "Checking $component..."
    
    if eval "$check_command" >/dev/null 2>&1; then
        success "$success_message"
        DEPLOYMENT_STATUS+=("$component:SUCCESS")
        return 0
    else
        error "$failure_message"
        DEPLOYMENT_STATUS+=("$component:FAILED")
        return 1
    fi
}

send_telegram_notification() {
    local message=$1
    local status=$2
    
    if [ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_ADMIN_CHAT_ID:-}" ]; then
        local emoji="🚀"
        if [ "$status" = "FAILED" ]; then
            emoji="❌"
        elif [ "$status" = "WARNING" ]; then
            emoji="⚠️"
        fi
        
        TELEGRAM_URL="https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage"
        FULL_MESSAGE="$emoji **Deployment Verification**

$message

🕐 Time: $(date '+%Y-%m-%d %H:%M:%S')
🏰 Notion MCP Server"

        curl -s -X POST "$TELEGRAM_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"chat_id\": \"${TELEGRAM_ADMIN_CHAT_ID}\",
                \"text\": \"$FULL_MESSAGE\",
                \"parse_mode\": \"Markdown\"
            }" >/dev/null 2>&1 || warning "Failed to send Telegram notification"
    fi
}

log "🚀 Starting Three-Component Deployment Verification..."

# Component 1: MCP Server
section "Component 1: MCP Server Core"

log "Building MCP Server..."
if cd backend && npm run build >/dev/null 2>&1; then
    success "MCP Server build successful"
    cd ..
else
    error "MCP Server build failed"
    cd ..
    exit 1
fi

check_deployment_component \
    "MCP-BUILD" \
    "[ -f backend/build/index.js ]" \
    "MCP Server build artifacts present" \
    "MCP Server build artifacts missing"

# Test MCP server startup (quick test)
log "Testing MCP Server startup..."
run_with_timeout 10 node backend/build/index.js >/dev/null 2>&1 &
MCP_PID=$!
sleep 3

if kill -0 $MCP_PID 2>/dev/null; then
    success "MCP Server starts successfully"
    kill $MCP_PID 2>/dev/null || true
    DEPLOYMENT_STATUS+=("MCP-STARTUP:SUCCESS")
else
    error "MCP Server startup failed"
    DEPLOYMENT_STATUS+=("MCP-STARTUP:FAILED")
fi

# Component 2: Gateway API
section "Component 2: Gateway API Server"

check_deployment_component \
    "GATEWAY-FILES" \
    "[ -f backend/server/app.js ]" \
    "Gateway API files present" \
    "Gateway API files missing"

# Test Gateway startup
log "Testing Gateway API startup..."
cd backend
timeout 15 node server/app.js >/dev/null 2>&1 &
GATEWAY_PID=$!
cd ..
sleep 5

if kill -0 $GATEWAY_PID 2>/dev/null; then
    success "Gateway API starts successfully"
    
    # Test health endpoint
    if curl -f -s http://localhost:3001/health >/dev/null 2>&1; then
        success "Gateway health endpoint responding"
        DEPLOYMENT_STATUS+=("GATEWAY-HEALTH:SUCCESS")
    else
        warning "Gateway health endpoint not responding"
        DEPLOYMENT_STATUS+=("GATEWAY-HEALTH:WARNING")
    fi
    
    kill $GATEWAY_PID 2>/dev/null || true
    DEPLOYMENT_STATUS+=("GATEWAY-STARTUP:SUCCESS")
else
    error "Gateway API startup failed"
    DEPLOYMENT_STATUS+=("GATEWAY-STARTUP:FAILED")
fi

# Component 3: Web Interface
section "Component 3: Web Interface"

WEB_INTERFACE_FOUND=false

# Check for web interface in multiple possible locations
WEB_LOCATIONS=(
    "frontend/modern/lz-labs-main/web-chat"
    "backend/web-chat"
    "web-chat"
    "frontend"
)

for location in "${WEB_LOCATIONS[@]}"; do
    if [ -d "$location" ] && [ -f "$location/package.json" ]; then
        success "Web interface found in $location"
        WEB_INTERFACE_FOUND=true
        
        # Test build
        log "Testing web interface build..."
        cd "$location"
        if npm run build >/dev/null 2>&1; then
            success "Web interface builds successfully"
            DEPLOYMENT_STATUS+=("WEB-BUILD:SUCCESS")
        else
            warning "Web interface build failed"
            DEPLOYMENT_STATUS+=("WEB-BUILD:WARNING")
        fi
        cd - >/dev/null
        break
    fi
done

if [ "$WEB_INTERFACE_FOUND" = false ]; then
    warning "Web interface not found in expected locations"
    DEPLOYMENT_STATUS+=("WEB-INTERFACE:WARNING")
else
    DEPLOYMENT_STATUS+=("WEB-INTERFACE:SUCCESS")
fi

# Check GitHub Pages deployment
section "GitHub Pages Deployment"

if [ -f ".github/workflows/deploy-pages.yml" ]; then
    success "GitHub Pages workflow configured"
    DEPLOYMENT_STATUS+=("GITHUB-PAGES:SUCCESS")
else
    warning "GitHub Pages workflow not found"
    DEPLOYMENT_STATUS+=("GITHUB-PAGES:WARNING")
fi

# Check Railway deployment
section "Railway Deployment"

if [ -f "railway.toml" ] && [ -f "railway.json" ]; then
    success "Railway deployment configurations present"
    DEPLOYMENT_STATUS+=("RAILWAY-CONFIG:SUCCESS")
else
    warning "Railway deployment configurations incomplete"
    DEPLOYMENT_STATUS+=("RAILWAY-CONFIG:WARNING")
fi

# Check Docker deployment
section "Docker Deployment"

DOCKER_FILES=("Dockerfile.mcp-only" "Dockerfile.enhanced" "docker-compose.mcp-only.yml")
DOCKER_COUNT=0

for dockerfile in "${DOCKER_FILES[@]}"; do
    if [ -f "$dockerfile" ]; then
        ((DOCKER_COUNT++))
    fi
done

if [ $DOCKER_COUNT -gt 0 ]; then
    success "$DOCKER_COUNT Docker configuration files found"
    DEPLOYMENT_STATUS+=("DOCKER-CONFIG:SUCCESS")
else
    warning "No Docker configuration files found"
    DEPLOYMENT_STATUS+=("DOCKER-CONFIG:WARNING")
fi

# Environment Configuration Check
section "Environment Configuration"

if [ -f ".env.example" ]; then
    ENV_VARS=$(wc -l < .env.example)
    success "Environment template with $ENV_VARS variables"
    DEPLOYMENT_STATUS+=("ENV-CONFIG:SUCCESS")
else
    warning "Environment template missing"
    DEPLOYMENT_STATUS+=("ENV-CONFIG:WARNING")
fi

# Security Check
section "Security Verification"

log "Running security audit..."
cd backend
AUDIT_RESULT=$(npm audit --audit-level moderate 2>&1 || echo "vulnerabilities detected")
cd ..

if echo "$AUDIT_RESULT" | grep -q "found 0 vulnerabilities"; then
    success "No security vulnerabilities detected"
    DEPLOYMENT_STATUS+=("SECURITY:SUCCESS")
else
    warning "Security vulnerabilities detected - review required"
    DEPLOYMENT_STATUS+=("SECURITY:WARNING")
fi

# Generate Deployment Report
section "Deployment Verification Summary"

SUCCESS_COUNT=0
WARNING_COUNT=0
FAILED_COUNT=0

echo "📊 Component Status Report:"
echo ""

for status in "${DEPLOYMENT_STATUS[@]}"; do
    component=$(echo "$status" | cut -d: -f1)
    result=$(echo "$status" | cut -d: -f2)
    
    if [ "$result" = "SUCCESS" ]; then
        echo -e "  ✅ $component: ${GREEN}SUCCESS${NC}"
        ((SUCCESS_COUNT++))
    elif [ "$result" = "WARNING" ]; then
        echo -e "  ⚠️  $component: ${YELLOW}WARNING${NC}"
        ((WARNING_COUNT++))
    else
        echo -e "  ❌ $component: ${RED}FAILED${NC}"
        ((FAILED_COUNT++))
    fi
done

echo ""
echo "📈 Summary Statistics:"
echo "  ✅ Successful: $SUCCESS_COUNT"
echo "  ⚠️  Warnings: $WARNING_COUNT"  
echo "  ❌ Failed: $FAILED_COUNT"

# Determine overall status
OVERALL_STATUS="SUCCESS"
TELEGRAM_STATUS="SUCCESS"
if [ $FAILED_COUNT -gt 0 ]; then
    OVERALL_STATUS="FAILED"
    TELEGRAM_STATUS="FAILED"
elif [ $WARNING_COUNT -gt 0 ]; then
    OVERALL_STATUS="WARNING"
    TELEGRAM_STATUS="WARNING"
fi

echo ""
if [ "$OVERALL_STATUS" = "SUCCESS" ]; then
    success "🎉 All three components are ready for deployment!"
elif [ "$OVERALL_STATUS" = "WARNING" ]; then
    warning "⚠️  Deployment ready with warnings - review recommended"
else
    error "❌ Deployment verification failed - issues must be resolved"
fi

# Create deployment readiness report
REPORT_FILE="deployment-verification-$(date +%Y%m%d-%H%M%S).md"
cat > "$REPORT_FILE" << EOF
# 🚀 Deployment Verification Report

**Generated:** $(date '+%Y-%m-%d %H:%M:%S')
**Overall Status:** $OVERALL_STATUS

## Component Status

$(for status in "${DEPLOYMENT_STATUS[@]}"; do
    component=$(echo "$status" | cut -d: -f1)
    result=$(echo "$status" | cut -d: -f2)
    if [ "$result" = "SUCCESS" ]; then
        echo "- ✅ **$component**: Success"
    elif [ "$result" = "WARNING" ]; then
        echo "- ⚠️ **$component**: Warning"
    else
        echo "- ❌ **$component**: Failed"
    fi
done)

## Statistics

- **Successful Components:** $SUCCESS_COUNT
- **Warnings:** $WARNING_COUNT
- **Failed Components:** $FAILED_COUNT

## Deployment URLs

- **Local Gateway:** http://localhost:3001
- **Local Web Interface:** http://localhost:3002
- **Health Check:** http://localhost:3001/health
- **GitHub Pages:** https://billlzzz10.github.io/notion-mcp-server
- **Railway:** (Configure in Railway dashboard)

## Next Steps

$(if [ "$OVERALL_STATUS" = "SUCCESS" ]; then
    echo "✅ Ready for production deployment"
    echo "✅ All components verified"
    echo "✅ Can deploy to Railway, Docker, or local"
elif [ "$OVERALL_STATUS" = "WARNING" ]; then
    echo "⚠️ Review warnings before production"
    echo "✅ Core functionality verified"
    echo "📝 Address optional components as needed"
else
    echo "❌ Resolve failed components before deployment"
    echo "🔧 Check logs for detailed error information"
    echo "📞 Contact support if issues persist"
fi)

---
*Generated by Three-Component Deployment Verification Script*
EOF

success "Deployment report saved: $REPORT_FILE"

# Send notification
NOTIFICATION_MESSAGE="Deployment Verification Complete

Status: $OVERALL_STATUS
✅ Success: $SUCCESS_COUNT
⚠️ Warnings: $WARNING_COUNT  
❌ Failed: $FAILED_COUNT

Components: MCP Server, Gateway API, Web Interface
Report: $REPORT_FILE"

send_telegram_notification "$NOTIFICATION_MESSAGE" "$TELEGRAM_STATUS"

# Exit with appropriate code
if [ "$OVERALL_STATUS" = "FAILED" ]; then
    exit 1
elif [ "$OVERALL_STATUS" = "WARNING" ]; then
    exit 2
else
    exit 0
fi