#!/bin/bash

# 🚀 Notion MCP Server - Technology Enhancement Installation
# สคริปต์ติดตั้งเทคโนโลยีใหม่แบบครอบคลุม
# Based on user feedback from PR comments asking for technology improvements

set -e

echo "🚀 Installing Enhanced Technology Stack for Notion MCP Server..."
echo "การติดตั้งเทคโนโลยีขั้นสูงสำหรับ Notion MCP Server"
echo "Implementing suggestions from GitHub PR comments..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Node.js version
check_node_version() {
    print_status "Checking Node.js version..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    node_version=$(node -v | cut -d 'v' -f2 | cut -d '.' -f1)
    if [ "$node_version" -lt 18 ]; then
        print_error "Node.js version 18+ required. Current: $(node -v)"
        exit 1
    fi
    
    print_status "Node.js version OK: $(node -v)"
}

# Backup current package.json
backup_package_json() {
    print_status "Creating backup of package.json..."
    if [ -f "backend/package.json" ]; then
        cp backend/package.json backend/package.json.backup.$(date +%Y%m%d_%H%M%S)
        print_status "Backup created successfully"
    fi
}

# Install Vector Database dependencies
install_vector_db() {
    print_status "Installing Vector Database dependencies..."
    cd backend
    
    # ChromaDB (already exists, update if needed)
    npm install chromadb@latest
    
    # Pinecone for production vector search
    npm install @pinecone-database/pinecone
    
    # Qdrant as alternative
    npm install @qdrant/js-client-rest
    
    # Supabase for pgvector support
    npm install @supabase/supabase-js
    
    print_status "Vector Database dependencies installed"
    cd ..
}

# Install Real-time dependencies
install_realtime() {
    print_status "Installing Real-time collaboration dependencies..."
    cd backend
    
    # Socket.io for WebSocket
    npm install socket.io
    npm install @socket.io/redis-adapter
    
    # Redis for caching and pub/sub
    npm install ioredis redis
    npm install connect-redis express-session
    
    print_status "Real-time dependencies installed"
    cd ..
}

# Install Enhanced AI dependencies
install_enhanced_ai() {
    print_status "Installing Enhanced AI dependencies..."
    cd backend
    
    # LangChain for advanced AI workflows
    npm install @langchain/core @langchain/community
    npm install @langchain/google-genai  # Already exists
    
    # Ollama for local LLM support
    npm install ollama
    
    # OpenAI and Anthropic clients
    npm install openai @anthropic-ai/sdk
    
    print_status "Enhanced AI dependencies installed"
    cd ..
}

# Install Content Processing dependencies
install_content_processing() {
    print_status "Installing Content Processing dependencies..."
    cd backend
    
    # Text-to-Speech services
    npm install @google-cloud/text-to-speech
    npm install @aws-sdk/client-polly
    npm install azure-cognitiveservices-speech-sdk
    
    # Document processing
    npm install pdf-parse mammoth docx epub-parser
    
    # Image processing
    npm install sharp jimp
    
    print_status "Content Processing dependencies installed"
    cd ..
}

# Install Monitoring and Analytics dependencies
install_monitoring() {
    print_status "Installing Monitoring and Analytics dependencies..."
    cd backend
    
    # Error tracking
    npm install @sentry/node @sentry/tracing
    npm install newrelic
    
    # Metrics and monitoring
    npm install prom-client express-prometheus-middleware
    npm install node-cron
    
    # Performance monitoring
    npm install clinic
    npm install 0x
    
    print_status "Monitoring dependencies installed"
    cd ..
}

# Install Development and Testing dependencies
install_dev_tools() {
    print_status "Installing Development and Testing tools..."
    cd backend
    
    # Testing framework
    npm install --save-dev jest @types/jest ts-jest
    npm install --save-dev supertest @types/supertest
    
    # Code quality
    npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
    npm install --save-dev prettier eslint-config-prettier
    
    # Type definitions
    npm install --save-dev @types/express @types/redis @types/node-cron
    
    print_status "Development tools installed"
    cd ..
}

# Update TypeScript configuration
update_typescript_config() {
    print_status "Updating TypeScript configuration..."
    
    if [ -f "backend/tsconfig.json" ]; then
        # Backup existing config
        cp backend/tsconfig.json backend/tsconfig.json.backup.$(date +%Y%m%d_%H%M%S)
        
        # Update with enhanced configuration
        cat > backend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleDetection": "force",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": false,
    "declaration": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node", "jest"]
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "build",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
EOF
        print_status "TypeScript configuration updated"
    fi
}

# Create enhanced environment example
create_enhanced_env_example() {
    print_status "Creating enhanced .env.example..."
    
    # Backup existing .env.example
    if [ -f ".env.example" ]; then
        cp .env.example .env.example.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    cat >> .env.example << 'EOF'

# === Enhanced Technology Configuration ===

# Vector Database Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX_NAME=ashval-content

QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# Real-time Configuration
WEBSOCKET_PORT=3003
WEBSOCKET_CORS_ORIGIN=http://localhost:3002

# Enhanced AI Configuration
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
OLLAMA_BASE_URL=http://localhost:11434

# Text-to-Speech Configuration
GOOGLE_TTS_KEY_FILE=path/to/google-tts-key.json
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=your_azure_region

# Monitoring Configuration
SENTRY_DSN=your_sentry_dsn
NEW_RELIC_LICENSE_KEY=your_newrelic_license_key
NEW_RELIC_APP_NAME=notion-mcp-server

# Analytics Configuration
ANALYTICS_ENABLED=true
METRICS_PORT=9090
HEALTH_CHECK_INTERVAL=30000

# Content Processing Configuration
MAX_FILE_SIZE=50MB
SUPPORTED_FORMATS=pdf,docx,epub,txt,md
IMAGE_PROCESSING_ENABLED=true
MAX_IMAGE_SIZE=10MB

# Development Configuration
LOG_LEVEL=info
DEBUG_MODE=false
ENABLE_PROFILING=false
EOF

    print_status "Enhanced .env.example created"
}

# Create installation verification script
create_verification_script() {
    print_status "Creating installation verification script..."
    
    cat > scripts/verify-enhanced-installation.js << 'EOF'
#!/usr/bin/env node

// Enhanced Installation Verification Script
const { exec } = require('child_process');
const fs = require('fs');

const requiredDependencies = [
    '@pinecone-database/pinecone',
    'chromadb',
    'socket.io',
    'ioredis',
    '@langchain/core',
    '@sentry/node',
    'sharp',
    'pdf-parse'
];

const checkDependency = (dep) => {
    try {
        require.resolve(dep);
        console.log(`✅ ${dep}: OK`);
        return true;
    } catch (error) {
        console.log(`❌ ${dep}: Missing`);
        return false;
    }
};

const main = async () => {
    console.log('🔍 Verifying Enhanced Installation...\n');
    
    let allGood = true;
    
    // Check dependencies
    console.log('📦 Checking Dependencies:');
    for (const dep of requiredDependencies) {
        if (!checkDependency(dep)) {
            allGood = false;
        }
    }
    
    // Check configuration files
    console.log('\n📋 Checking Configuration Files:');
    const configFiles = [
        'backend/tsconfig.json',
        '.env.example',
        'backend/package.json'
    ];
    
    for (const file of configFiles) {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file}: OK`);
        } else {
            console.log(`❌ ${file}: Missing`);
            allGood = false;
        }
    }
    
    // Check TypeScript compilation
    console.log('\n🔧 Checking TypeScript Compilation:');
    exec('cd backend && npx tsc --noEmit', (error, stdout, stderr) => {
        if (error) {
            console.log('❌ TypeScript compilation: Failed');
            console.log(stderr);
            allGood = false;
        } else {
            console.log('✅ TypeScript compilation: OK');
        }
        
        // Final result
        console.log('\n' + '='.repeat(50));
        if (allGood) {
            console.log('🎉 Enhanced installation completed successfully!');
            console.log('Next steps:');
            console.log('1. Copy .env.example to .env and configure');
            console.log('2. Run: npm run build');
            console.log('3. Run: npm run dev-mcp-only');
        } else {
            console.log('❌ Installation has issues. Please check the errors above.');
        }
    });
};

main().catch(console.error);
EOF

    chmod +x scripts/verify-enhanced-installation.js
    print_status "Verification script created"
}

# Main installation process
main() {
    print_status "=== Enhanced Technology Installation Starting ==="
    
    # Pre-installation checks
    check_node_version
    backup_package_json
    
    # Create scripts directory if it doesn't exist
    mkdir -p scripts
    
    # Install dependencies by category
    install_vector_db
    install_realtime
    install_enhanced_ai
    install_content_processing
    install_monitoring
    install_dev_tools
    
    # Update configuration
    update_typescript_config
    create_enhanced_env_example
    create_verification_script
    
    # Run security audit
    print_status "Running security audit..."
    cd backend && npm audit --audit-level moderate || true
    cd ..
    
    # Build the project
    print_status "Building the project..."
    cd backend && npm run build || print_warning "Build failed - check TypeScript errors"
    cd ..
    
    print_status "=== Installation Completed ==="
    print_status "Run './scripts/verify-enhanced-installation.js' to verify installation"
    print_status "Next: Configure .env file and restart the server"
}

# Run main function
main "$@"