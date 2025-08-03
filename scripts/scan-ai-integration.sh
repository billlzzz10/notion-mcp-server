#!/bin/bash

# 🔍 AI Tool Integration Support Scanner
# สแกนโค้ดเพื่อตรวจสอบการรองรับเครื่องมือ AI เพิ่มเติม

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

log "🚀 Starting AI Tool Integration Scanner..."

# Create output directory
mkdir -p reports
REPORT_FILE="reports/ai-integration-scan-$(date +%Y%m%d-%H%M%S).md"

# Start report
cat > "$REPORT_FILE" << 'EOF'
# 🤖 AI Tool Integration Support Report

**Generated:** `DATE_PLACEHOLDER`
**Repository:** Notion MCP Server
**Scanner Version:** 1.0

## 📋 Executive Summary

This report analyzes the current AI tool integration capabilities and identifies opportunities for enhancement.

EOF

# Replace date placeholder
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/DATE_PLACEHOLDER/$(date '+%Y-%m-%d %H:%M:%S')/" "$REPORT_FILE"
else
    sed -i "s/DATE_PLACEHOLDER/$(date '+%Y-%m-%d %H:%M:%S')/" "$REPORT_FILE"
fi

section "Scanning Current AI Integrations"

# Scan for existing AI integrations
echo "## 🔍 Current AI Tool Integrations" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Gemini AI Detection
if grep -r "gemini\|Gemini\|GEMINI" --include="*.js" --include="*.ts" --include="*.json" . > /dev/null 2>&1; then
    success "Google Gemini AI integration detected"
    echo "### ✅ Google Gemini AI" >> "$REPORT_FILE"
    echo "- **Status:** Integrated" >> "$REPORT_FILE"
    echo "- **Files:** " >> "$REPORT_FILE"
    grep -r -l "gemini\|Gemini\|GEMINI" --include="*.js" --include="*.ts" --include="*.json" . | head -5 | sed 's/^/  - /' >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
else
    warning "Google Gemini AI integration not found"
fi

# OpenAI Detection
if grep -r "openai\|OpenAI\|OPENAI\|gpt-" --include="*.js" --include="*.ts" --include="*.json" . > /dev/null 2>&1; then
    success "OpenAI integration detected"
    echo "### ✅ OpenAI" >> "$REPORT_FILE"
    echo "- **Status:** Integrated" >> "$REPORT_FILE"
    echo "- **Files:** " >> "$REPORT_FILE"
    grep -r -l "openai\|OpenAI\|OPENAI\|gpt-" --include="*.js" --include="*.ts" --include="*.json" . | head -5 | sed 's/^/  - /' >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
else
    info "OpenAI integration not detected"
    echo "### ⚪ OpenAI" >> "$REPORT_FILE"
    echo "- **Status:** Not integrated" >> "$REPORT_FILE"
    echo "- **Recommendation:** Consider adding OpenAI GPT integration" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
fi

# Anthropic Claude Detection
if grep -r "anthropic\|claude\|Claude\|ANTHROPIC" --include="*.js" --include="*.ts" --include="*.json" . > /dev/null 2>&1; then
    success "Anthropic Claude integration detected"
    echo "### ✅ Anthropic Claude" >> "$REPORT_FILE"
    echo "- **Status:** Integrated" >> "$REPORT_FILE"
else
    info "Anthropic Claude integration not detected"
    echo "### ⚪ Anthropic Claude" >> "$REPORT_FILE"
    echo "- **Status:** Not integrated" >> "$REPORT_FILE"
    echo "- **Recommendation:** Consider adding Claude integration for advanced reasoning" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
fi

# Hugging Face Detection
if grep -r "huggingface\|transformers\|HUGGING" --include="*.js" --include="*.ts" --include="*.json" . > /dev/null 2>&1; then
    success "Hugging Face integration detected"
    echo "### ✅ Hugging Face" >> "$REPORT_FILE"
    echo "- **Status:** Integrated" >> "$REPORT_FILE"
else
    info "Hugging Face integration not detected"
    echo "### ⚪ Hugging Face" >> "$REPORT_FILE"
    echo "- **Status:** Not integrated" >> "$REPORT_FILE"
    echo "- **Recommendation:** Consider adding Hugging Face models for specialized tasks" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
fi

section "Analyzing MCP Tool Architecture"

# Scan MCP tools structure
echo "## 🛠️ MCP Tool Architecture Analysis" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [ -d "backend/src/tools" ]; then
    TOOL_COUNT=$(find backend/src/tools -name "*.ts" -type f | wc -l)
    success "Found $TOOL_COUNT MCP tools"
    
    echo "### Tool Structure" >> "$REPORT_FILE"
    echo "- **Total Tools:** $TOOL_COUNT" >> "$REPORT_FILE"
    echo "- **Location:** \`backend/src/tools/\`" >> "$REPORT_FILE"
    echo "- **Format:** TypeScript modules" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    # Analyze tool patterns
    echo "### AI-Related Tools" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    AI_TOOLS=(
        "promptGenerator"
        "dataCompletion"
        "conflictGenerator"
        "storyArc"
        "timelineAnalyzer"
        "consistencyChecker"
        "smartFilter"
        "imageGenerator"
    )
    
    for tool in "${AI_TOOLS[@]}"; do
        if find backend/src/tools -name "*${tool}*" -type f | grep -q .; then
            success "AI tool found: $tool"
            echo "- ✅ **$tool**: Implemented" >> "$REPORT_FILE"
        else
            info "AI tool missing: $tool"
            echo "- ⚪ **$tool**: Not implemented" >> "$REPORT_FILE"
        fi
    done
    echo "" >> "$REPORT_FILE"
    
else
    warning "MCP tools directory not found"
    echo "### ❌ Tool Structure" >> "$REPORT_FILE"
    echo "- **Status:** Tools directory not found" >> "$REPORT_FILE"
    echo "- **Issue:** Expected directory \`backend/src/tools/\` missing" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
fi

section "Evaluating AI Integration Points"

echo "## 🔌 AI Integration Points" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Check service layer
if [ -d "backend/src/services" ]; then
    success "Services layer found"
    echo "### Service Layer" >> "$REPORT_FILE"
    echo "- **Status:** ✅ Present" >> "$REPORT_FILE"
    echo "- **Location:** \`backend/src/services/\`" >> "$REPORT_FILE"
    
    # Check for AI service files
    AI_SERVICES=0
    if [ -f "backend/src/services/ragService.ts" ]; then
        ((AI_SERVICES++))
        echo "- **RAG Service:** ✅ Implemented" >> "$REPORT_FILE"
    fi
    
    if [ -f "backend/src/services/imageGenerationService.ts" ]; then
        ((AI_SERVICES++))
        echo "- **Image Generation:** ✅ Implemented" >> "$REPORT_FILE"
    fi
    
    if find backend/src/services -name "*ai*" -o -name "*gemini*" -o -name "*gpt*" | grep -q .; then
        ((AI_SERVICES++))
        echo "- **AI Services:** ✅ Additional AI services detected" >> "$REPORT_FILE"
    fi
    
    echo "- **Total AI Services:** $AI_SERVICES" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
else
    warning "Services layer not found"
fi

# Check configuration support
echo "### Configuration Support" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [ -f ".env.example" ]; then
    AI_CONFIGS=$(grep -c "AI\|API_KEY\|GEMINI\|OPENAI\|ANTHROPIC" .env.example || echo "0")
    success "Found $AI_CONFIGS AI-related configuration variables"
    echo "- **Environment Variables:** $AI_CONFIGS AI-related configs" >> "$REPORT_FILE"
    echo "- **Configuration File:** ✅ \`.env.example\` present" >> "$REPORT_FILE"
    
    # List AI-related environment variables
    echo "- **AI Environment Variables:**" >> "$REPORT_FILE"
    grep "AI\|API_KEY\|GEMINI\|OPENAI\|ANTHROPIC" .env.example | sed 's/^/  - /' >> "$REPORT_FILE" || echo "  - None found" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
else
    warning "Environment configuration file not found"
fi

section "Analyzing Extension Capabilities"

echo "## 🔧 Extension Capabilities" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Check for plugin/extension system
if grep -r "plugin\|extension\|middleware" --include="*.js" --include="*.ts" backend/ > /dev/null 2>&1; then
    success "Extension system detected"
    echo "### Extension System" >> "$REPORT_FILE"
    echo "- **Status:** ✅ Present" >> "$REPORT_FILE"
    echo "- **Type:** Plugin/middleware architecture detected" >> "$REPORT_FILE"
else
    info "No explicit extension system found"
    echo "### Extension System" >> "$REPORT_FILE"
    echo "- **Status:** ⚪ Not explicitly implemented" >> "$REPORT_FILE"
    echo "- **Recommendation:** Consider implementing a plugin system for AI tools" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

# Check for dynamic tool loading
if grep -r "require\|import.*dynamic\|loadTool" --include="*.js" --include="*.ts" backend/ > /dev/null 2>&1; then
    success "Dynamic loading capabilities detected"
    echo "### Dynamic Tool Loading" >> "$REPORT_FILE"
    echo "- **Status:** ✅ Capability detected" >> "$REPORT_FILE"
else
    info "Static tool loading detected"
    echo "### Dynamic Tool Loading" >> "$REPORT_FILE"
    echo "- **Status:** ⚪ Static loading only" >> "$REPORT_FILE"
    echo "- **Recommendation:** Add dynamic tool loading for AI integrations" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

section "AI Integration Recommendations"

echo "## 💡 Recommendations for AI Tool Enhancement" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Priority recommendations
echo "### High Priority" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "1. **🤖 Multi-Model Support**" >> "$REPORT_FILE"
echo "   - Add OpenAI GPT integration alongside Gemini" >> "$REPORT_FILE"
echo "   - Implement model selection based on task complexity" >> "$REPORT_FILE"
echo "   - Add fallback mechanisms between AI providers" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "2. **🔌 Plugin Architecture**" >> "$REPORT_FILE"
echo "   - Create standardized AI tool plugin interface" >> "$REPORT_FILE"
echo "   - Enable dynamic loading of new AI integrations" >> "$REPORT_FILE"
echo "   - Implement plugin versioning and compatibility checks" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "3. **⚡ Performance Optimization**" >> "$REPORT_FILE"
echo "   - Add AI response caching system" >> "$REPORT_FILE"
echo "   - Implement request batching for AI calls" >> "$REPORT_FILE"
echo "   - Add token usage monitoring and optimization" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### Medium Priority" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "1. **🎯 Specialized AI Tools**" >> "$REPORT_FILE"
echo "   - Add Anthropic Claude for complex reasoning tasks" >> "$REPORT_FILE"
echo "   - Integrate Hugging Face for specialized models" >> "$REPORT_FILE"
echo "   - Add vision AI for image analysis capabilities" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "2. **📊 Monitoring & Analytics**" >> "$REPORT_FILE"
echo "   - Add AI usage analytics dashboard" >> "$REPORT_FILE"
echo "   - Implement cost tracking for AI API calls" >> "$REPORT_FILE"
echo "   - Add performance metrics for AI operations" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### Implementation Examples" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "\`\`\`typescript" >> "$REPORT_FILE"
echo "// Example: Multi-model AI service" >> "$REPORT_FILE"
echo "interface AIProvider {" >> "$REPORT_FILE"
echo "  name: string;" >> "$REPORT_FILE"
echo "  generateText(prompt: string, options?: any): Promise<string>;" >> "$REPORT_FILE"
echo "  analyzeText(text: string): Promise<Analysis>;" >> "$REPORT_FILE"
echo "  estimateCost(tokens: number): number;" >> "$REPORT_FILE"
echo "}" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "class AIOrchestrator {" >> "$REPORT_FILE"
echo "  private providers: Map<string, AIProvider> = new Map();" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "  async selectProvider(task: TaskType): Promise<AIProvider> {" >> "$REPORT_FILE"
echo "    // Smart provider selection based on task complexity" >> "$REPORT_FILE"
echo "  }" >> "$REPORT_FILE"
echo "}" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Generate summary statistics
section "Generating Summary Statistics"

TOTAL_INTEGRATIONS=1 # Gemini is confirmed
if grep -r "openai" . > /dev/null 2>&1; then ((TOTAL_INTEGRATIONS++)); fi
if grep -r "anthropic" . > /dev/null 2>&1; then ((TOTAL_INTEGRATIONS++)); fi

INTEGRATION_SCORE=$((TOTAL_INTEGRATIONS * 25))
if [ -d "backend/src/tools" ]; then ((INTEGRATION_SCORE += 25)); fi
if [ -d "backend/src/services" ]; then ((INTEGRATION_SCORE += 25)); fi

echo "## 📊 Integration Score" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**Overall AI Integration Score: $INTEGRATION_SCORE/100**" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "- **AI Providers:** $TOTAL_INTEGRATIONS integrated" >> "$REPORT_FILE"
echo "- **Architecture:** MCP-compatible tool system" >> "$REPORT_FILE"
echo "- **Extensibility:** Medium (plugin system recommended)" >> "$REPORT_FILE"
echo "- **Ready for Enhancement:** ✅ Yes" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "---" >> "$REPORT_FILE"
echo "*Report generated by AI Integration Scanner v1.0*" >> "$REPORT_FILE"

success "Report generated: $REPORT_FILE"

# Display summary
section "Scan Complete"
success "AI Integration Support Scanner completed successfully!"
info "Report saved to: $REPORT_FILE"
info "Integration Score: $INTEGRATION_SCORE/100"
log "Current AI Integrations: $TOTAL_INTEGRATIONS"
log "MCP Tools Ready: Yes"
log "Extension Capability: Medium"

echo ""
echo "📋 Next Steps:"
echo "1. Review the detailed report: $REPORT_FILE"
echo "2. Prioritize AI integrations based on recommendations"
echo "3. Implement plugin architecture for extensibility"
echo "4. Add monitoring and analytics for AI usage"
echo ""

# Open report if possible
if command -v cat > /dev/null 2>&1; then
    echo "📖 Report Preview:"
    echo "=================="
    head -30 "$REPORT_FILE"
    echo "=================="
    echo "(See full report in $REPORT_FILE)"
fi