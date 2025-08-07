// Azure Bicep template for Notion MCP Server deployment
// This template creates all necessary Azure resources for the 3-service architecture

@description('The name prefix for all resources')
param resourcePrefix string = 'notion-mcp'

@description('The location for all resources')
param location string = resourceGroup().location

@description('Environment name (dev, staging, prod)')
param environment string = 'prod'

@description('Container registry name')
param registryName string = '${resourcePrefix}registry${uniqueString(resourceGroup().id)}'

@description('Log Analytics workspace name')
param logAnalyticsName string = '${resourcePrefix}-logs-${environment}'

@description('Container Apps environment name')
param containerAppsEnvironmentName string = '${resourcePrefix}-env-${environment}'

// Variables
var resourceGroupName = resourceGroup().name
var appInsightsName = '${resourcePrefix}-insights-${environment}'

// Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: registryName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
  tags: {
    Environment: environment
    Project: 'notion-mcp-server'
  }
}

// Log Analytics Workspace
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
  tags: {
    Environment: environment
    Project: 'notion-mcp-server'
  }
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.id
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
  tags: {
    Environment: environment
    Project: 'notion-mcp-server'
  }
}

// Container Apps Environment
resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: containerAppsEnvironmentName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspace.properties.customerId
        sharedKey: logAnalyticsWorkspace.listKeys().primarySharedKey
      }
    }
    zoneRedundant: false
  }
  tags: {
    Environment: environment
    Project: 'notion-mcp-server'
  }
}

// 1. Notion MCP Server Container App
resource notionMcpServerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: '${resourcePrefix}-server-${environment}'
  location: location
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 8080
        allowInsecure: false
        traffic: [
          {
            weight: 100
            latestRevision: true
          }
        ]
      }
      registries: [
        {
          server: containerRegistry.properties.loginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'registry-password'
        }
      ]
      secrets: [
        {
          name: 'registry-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
        {
          name: 'notion-token'
          value: '' // Will be set via GitHub secrets
        }
        {
          name: 'azure-openai-endpoint'
          value: '' // Will be set via GitHub secrets
        }
        {
          name: 'azure-openai-api-key'
          value: '' // Will be set via GitHub secrets
        }
        {
          name: 'azure-openai-deployment-name'
          value: '' // Will be set via GitHub secrets
        }
      ]
    }
    template: {
      containers: [
        {
          image: '${containerRegistry.properties.loginServer}/notion-mcp-server:latest'
          name: 'notion-mcp-server'
          env: [
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'MCP_PORT'
              value: '8080'
            }
            {
              name: 'NOTION_TOKEN'
              secretRef: 'notion-token'
            }
            {
              name: 'AZURE_OPENAI_ENDPOINT'
              secretRef: 'azure-openai-endpoint'
            }
            {
              name: 'AZURE_OPENAI_API_KEY'
              secretRef: 'azure-openai-api-key'
            }
            {
              name: 'AZURE_OPENAI_DEPLOYMENT_NAME'
              secretRef: 'azure-openai-deployment-name'
            }
            {
              name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
              value: appInsights.properties.ConnectionString
            }
          ]
          resources: {
            cpu: '0.5'
            memory: '1Gi'
          }
          probes: [
            {
              type: 'Readiness'
              httpGet: {
                path: '/health'
                port: 8080
              }
              periodSeconds: 30
              timeoutSeconds: 10
            }
            {
              type: 'Liveness'
              httpGet: {
                path: '/health'
                port: 8080
              }
              periodSeconds: 30
              timeoutSeconds: 10
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '50'
              }
            }
          }
        ]
      }
    }
  }
  tags: {
    Environment: environment
    Project: 'notion-mcp-server'
    Service: 'notion-mcp-server'
  }
}

// 2. Agent API Container App
resource agentApiApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: '${resourcePrefix}-agent-${environment}'
  location: location
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 8000
        allowInsecure: false
        traffic: [
          {
            weight: 100
            latestRevision: true
          }
        ]
      }
      registries: [
        {
          server: containerRegistry.properties.loginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'registry-password'
        }
      ]
      secrets: [
        {
          name: 'registry-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
        {
          name: 'azure-openai-endpoint'
          value: '' // Will be set via GitHub secrets
        }
        {
          name: 'azure-openai-api-key'
          value: '' // Will be set via GitHub secrets
        }
        {
          name: 'azure-openai-deployment-name'
          value: '' // Will be set via GitHub secrets
        }
        {
          name: 'notion-token'
          value: '' // Will be set via GitHub secrets
        }
      ]
    }
    template: {
      containers: [
        {
          image: '${containerRegistry.properties.loginServer}/agent-api:latest'
          name: 'agent-api'
          env: [
            {
              name: 'PYTHON_ENV'
              value: 'production'
            }
            {
              name: 'API_PORT'
              value: '8000'
            }
            {
              name: 'AZURE_OPENAI_ENDPOINT'
              secretRef: 'azure-openai-endpoint'
            }
            {
              name: 'AZURE_OPENAI_API_KEY'
              secretRef: 'azure-openai-api-key'
            }
            {
              name: 'AZURE_OPENAI_DEPLOYMENT_NAME'
              secretRef: 'azure-openai-deployment-name'
            }
            {
              name: 'NOTION_TOKEN'
              secretRef: 'notion-token'
            }
            {
              name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
              value: appInsights.properties.ConnectionString
            }
          ]
          resources: {
            cpu: '1.0'
            memory: '2Gi'
          }
          probes: [
            {
              type: 'Readiness'
              httpGet: {
                path: '/health'
                port: 8000
              }
              periodSeconds: 30
              timeoutSeconds: 10
            }
            {
              type: 'Liveness'
              httpGet: {
                path: '/health'
                port: 8000
              }
              periodSeconds: 30
              timeoutSeconds: 10
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 5
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '30'
              }
            }
          }
        ]
      }
    }
  }
  tags: {
    Environment: environment
    Project: 'notion-mcp-server'
    Service: 'agent-api'
  }
}

// 3. Gateway Frontend Container App
resource gatewayApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: '${resourcePrefix}-gateway-${environment}'
  location: location
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 3000
        allowInsecure: false
        traffic: [
          {
            weight: 100
            latestRevision: true
          }
        ]
      }
      registries: [
        {
          server: containerRegistry.properties.loginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'registry-password'
        }
      ]
      secrets: [
        {
          name: 'registry-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
        {
          name: 'azure-openai-endpoint'
          value: '' // Will be set via GitHub secrets
        }
        {
          name: 'notion-token'
          value: '' // Will be set via GitHub secrets
        }
      ]
    }
    template: {
      containers: [
        {
          image: '${containerRegistry.properties.loginServer}/gateway:latest'
          name: 'gateway'
          env: [
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'PORT'
              value: '3000'
            }
            {
              name: 'NEXT_TELEMETRY_DISABLED'
              value: '1'
            }
            {
              name: 'AZURE_OPENAI_ENDPOINT'
              secretRef: 'azure-openai-endpoint'
            }
            {
              name: 'NOTION_TOKEN'
              secretRef: 'notion-token'
            }
            {
              name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
              value: appInsights.properties.ConnectionString
            }
          ]
          resources: {
            cpu: '0.5'
            memory: '1Gi'
          }
          probes: [
            {
              type: 'Readiness'
              httpGet: {
                path: '/api/health'
                port: 3000
              }
              periodSeconds: 30
              timeoutSeconds: 10
            }
            {
              type: 'Liveness'
              httpGet: {
                path: '/api/health'
                port: 3000
              }
              periodSeconds: 30
              timeoutSeconds: 10
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '50'
              }
            }
          }
        ]
      }
    }
  }
  tags: {
    Environment: environment
    Project: 'notion-mcp-server'
    Service: 'gateway'
  }
}

// Outputs
output containerRegistryLoginServer string = containerRegistry.properties.loginServer
output containerRegistryName string = containerRegistry.name
output containerAppsEnvironmentName string = containerAppsEnvironment.name
output resourceGroupName string = resourceGroupName

output notionMcpServerUrl string = 'https://${notionMcpServerApp.properties.configuration.ingress.fqdn}'
output agentApiUrl string = 'https://${agentApiApp.properties.configuration.ingress.fqdn}'
output gatewayUrl string = 'https://${gatewayApp.properties.configuration.ingress.fqdn}'

output logAnalyticsWorkspaceId string = logAnalyticsWorkspace.id
output appInsightsConnectionString string = appInsights.properties.ConnectionString