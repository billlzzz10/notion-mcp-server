# 🚀 Azure Container Apps Deployment Guide

This guide explains how to deploy the Notion MCP Server system to Azure Container Apps using the automated GitHub Actions workflow.

## 🏗️ Architecture Overview

The system consists of 3 microservices deployed to Azure Container Apps:

1. **notion-mcp-server** (Node.js) - Port 8080
   - Core MCP server functionality
   - Notion API integration
   - Express gateway API

2. **agent-api** (Python FastAPI) - Port 8000  
   - Azure OpenAI integration
   - AI agent processing
   - Batch operations support

3. **gateway** (Next.js Frontend) - Port 3000
   - Web interface
   - Static file serving
   - API routing

## 📋 Prerequisites

### 1. Azure Resources
- Azure subscription with Container Apps enabled
- Resource group for the deployment
- Azure OpenAI service with deployed models

### 2. GitHub Secrets Configuration
Add the following secrets to your GitHub repository:

```bash
# Azure Authentication
AZURE_CREDENTIALS='{
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret", 
  "subscriptionId": "your-subscription-id",
  "tenantId": "your-tenant-id"
}'

# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# Notion Integration
NOTION_TOKEN=secret_your-notion-integration-token
```

### 3. Azure Service Principal Setup
Create a service principal for GitHub Actions:

```bash
# Create service principal
az ad sp create-for-rbac \
  --name "notion-mcp-github-actions" \
  --role contributor \
  --scopes /subscriptions/{subscription-id} \
  --sdk-auth

# The output should be used as AZURE_CREDENTIALS secret
```

## 🚀 Deployment Options

### Option 1: Automatic Deployment
Push to `main` or `develop` branch to trigger automatic deployment:

```bash
git push origin main      # Deploys to production
git push origin develop   # Deploys to staging
```

### Option 2: Manual Deployment
Use GitHub Actions workflow dispatch:

1. Go to Actions tab in GitHub
2. Select "Deploy Notion MCP Server to Azure Container Apps"
3. Click "Run workflow"
4. Choose:
   - Environment: `dev`, `staging`, or `prod`
   - Deploy Infrastructure: `true` (for first deployment)

### Option 3: CLI Deployment
Deploy infrastructure manually:

```bash
# Login to Azure
az login

# Create resource group
az group create \
  --name "notion-mcp-rg-prod" \
  --location "East US"

# Deploy Bicep template
az deployment group create \
  --resource-group "notion-mcp-rg-prod" \
  --template-file infra/main.bicep \
  --parameters environment=prod
```

## 📁 Project Structure

```
notion-mcp-server/
├── .github/workflows/
│   └── deploy-azure.yml          # Main deployment workflow
├── infra/
│   ├── main.bicep               # Azure infrastructure template
│   └── parameters.yaml          # Environment parameters
├── agent-api/
│   ├── main.py                  # FastAPI application
│   ├── config.py                # Configuration settings
│   ├── requirements.txt         # Python dependencies
│   └── Dockerfile               # Python container
├── backend/
│   ├── src/
│   │   └── services/
│   │       └── azureOpenAIService.ts  # Azure OpenAI integration
│   └── Dockerfile.mcp-only      # Node.js container
├── frontend/
│   └── Dockerfile               # Frontend container
└── services.yaml                # Service configuration metadata
```

## 🔧 Configuration Files

### services.yaml
Defines all services and their configuration:

```yaml
services:
  notion-mcp-server:
    runtime: "nodejs"
    port: 8080
    cpu: "0.5"
    memory: "1Gi"
    
  agent-api:
    runtime: "python" 
    port: 8000
    cpu: "1.0"
    memory: "2Gi"
    
  gateway:
    runtime: "nodejs"
    port: 3000
    cpu: "0.5"
    memory: "1Gi"
```

### Environment Variables
Each service receives these environment variables:

**Common:**
- `NODE_ENV=production`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_DEPLOYMENT_NAME`
- `NOTION_TOKEN`

**Service-specific:**
- `MCP_PORT=8080` (notion-mcp-server)
- `API_PORT=8000` (agent-api)
- `PORT=3000` (gateway)

## 🔍 Monitoring & Health Checks

### Health Check Endpoints
- **notion-mcp-server**: `https://your-app.region.azurecontainerapps.io/health`
- **agent-api**: `https://your-app.region.azurecontainerapps.io/health`
- **gateway**: `https://your-app.region.azurecontainerapps.io/api/health`

### Application Insights
All services are configured with Application Insights for:
- Request tracing
- Performance monitoring  
- Error tracking
- Custom metrics

### Log Analytics
Centralized logging with:
- 30-day retention
- Structured JSON logs
- Query capabilities

## 🚨 Troubleshooting

### Common Issues

**1. Build Failures**
```bash
# Check build logs in GitHub Actions
# Common causes:
- Missing environment variables
- TypeScript compilation errors
- Python dependency conflicts
```

**2. Deployment Failures**
```bash
# Check Azure deployment status
az deployment group show \
  --resource-group "notion-mcp-rg-prod" \
  --name "main"

# Check container app status  
az containerapp show \
  --name "notion-mcp-server-prod" \
  --resource-group "notion-mcp-rg-prod"
```

**3. Health Check Failures**
```bash
# Check application logs
az containerapp logs show \
  --name "notion-mcp-server-prod" \
  --resource-group "notion-mcp-rg-prod"

# Test health endpoint
curl https://your-app.region.azurecontainerapps.io/health
```

### Debug Commands

```bash
# List all container apps
az containerapp list --resource-group "notion-mcp-rg-prod"

# Get app URLs
az containerapp show \
  --name "notion-mcp-server-prod" \
  --resource-group "notion-mcp-rg-prod" \
  --query properties.configuration.ingress.fqdn

# View real-time logs
az containerapp logs tail \
  --name "notion-mcp-server-prod" \
  --resource-group "notion-mcp-rg-prod"

# Scale app manually
az containerapp update \
  --name "notion-mcp-server-prod" \
  --resource-group "notion-mcp-rg-prod" \
  --min-replicas 2 \
  --max-replicas 5
```

## 📊 Performance & Scaling

### Auto-scaling Configuration
- **notion-mcp-server**: 1-3 replicas, scales on 50 concurrent requests
- **agent-api**: 1-5 replicas, scales on 30 concurrent requests  
- **gateway**: 1-3 replicas, scales on 50 concurrent requests

### Resource Limits
- **notion-mcp-server**: 0.5 CPU, 1Gi memory
- **agent-api**: 1.0 CPU, 2Gi memory (higher for AI processing)
- **gateway**: 0.5 CPU, 1Gi memory

### Cost Optimization
- Use consumption pricing tier for development
- Enable scale-to-zero for non-production environments
- Monitor resource usage with Application Insights

## 🔄 CI/CD Pipeline

### Workflow Stages
1. **Validate** - Check configuration and required files
2. **Build** - Build each service independently
3. **Infrastructure** - Deploy Azure resources (conditional)
4. **Docker** - Build and push container images
5. **Deploy** - Update container apps
6. **Validate** - Run health checks

### Deployment Strategy
- **Rolling updates** with zero downtime
- **Blue-green** deployment support via revision management
- **Rollback** capability through revision history

## 📚 Additional Resources

- [Azure Container Apps Documentation](https://docs.microsoft.com/en-us/azure/container-apps/)
- [Azure OpenAI Service Documentation](https://docs.microsoft.com/en-us/azure/ai-services/openai/)
- [GitHub Actions for Azure](https://github.com/Azure/actions)
- [Notion API Documentation](https://developers.notion.com/)

## 🤝 Support

For deployment issues:
1. Check GitHub Actions logs
2. Review Azure Container Apps logs
3. Verify secret configuration
4. Test health endpoints manually

---

**🎉 Happy Deploying!** 

This deployment configuration provides a robust, scalable, and monitored deployment of the Notion MCP Server system on Azure Container Apps.