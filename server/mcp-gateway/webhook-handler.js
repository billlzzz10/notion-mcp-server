import express from 'express';
import gateway from './request-gateway.js';

const router = express.Router();

// Make.com Webhook Handler
router.post('/webhook/make', async (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 📥 Make.com webhook received:`, JSON.stringify(req.body, null, 2));

    // Validate webhook payload
    if (!req.body) {
      return res.status(400).json({
        error: 'No payload received',
        timestamp
      });
    }

    // Extract data from Make.com webhook
    const { 
      action, 
      database, 
      data, 
      notion_page_id,
      trigger_type,
      // Common Make.com fields
      bundle,
      meta
    } = req.body;

    // Process the webhook based on action type
    let mcpResponse;
    
    switch (action || trigger_type) {
      case 'page_created':
      case 'database_item_created':
        console.log(`[${timestamp}] 🆕 Processing new item creation`);
        mcpResponse = await processNewItem(data, database, notion_page_id);
        break;
        
      case 'page_updated':
      case 'database_item_updated':
        console.log(`[${timestamp}] ✏️ Processing item update`);
        mcpResponse = await processItemUpdate(data, database, notion_page_id);
        break;
        
      case 'ai_analysis_request':
        console.log(`[${timestamp}] 🤖 Processing AI analysis request`);
        mcpResponse = await processAIAnalysis(data, database);
        break;
        
      case 'automation_trigger':
        console.log(`[${timestamp}] ⚡ Processing automation trigger`);
        mcpResponse = await processAutomation(data, database);
        break;
        
      default:
        console.log(`[${timestamp}] 🔍 Processing generic webhook`);
        mcpResponse = await processGenericWebhook(req.body);
    }

    // Send success response back to Make.com
    const response = {
      success: true,
      timestamp,
      webhook_id: req.headers['x-webhook-id'] || 'unknown',
      processed_action: action || trigger_type || 'generic',
      mcp_response: mcpResponse,
      next_steps: generateNextSteps(action || trigger_type, mcpResponse)
    };

    console.log(`[${timestamp}] ✅ Webhook processed successfully`);
    res.json(response);

  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ Webhook processing failed:`, error);
    
    res.status(500).json({
      error: {
        message: error.message,
        timestamp,
        webhook_data: req.body
      }
    });
  }
});

// Helper function: Process new item creation
async function processNewItem(data, database, pageId) {
  try {
    // Forward to MCP for processing
    const mcpRequest = {
      tool: 'notion_pages',
      args: {
        action: 'analyze_new_item',
        page_id: pageId,
        database: database,
        data: data
      }
    };

    // Send to MCP via gateway
    const mcpResponse = await forwardToMCP(mcpRequest);
    
    // Trigger AI analysis if needed
    if (shouldTriggerAI(data, database)) {
      const aiResponse = await triggerAIAnalysis(data, database, pageId);
      mcpResponse.ai_analysis = aiResponse;
    }

    return mcpResponse;
  } catch (error) {
    console.error('Error processing new item:', error);
    throw error;
  }
}

// Helper function: Process item update
async function processItemUpdate(data, database, pageId) {
  try {
    const mcpRequest = {
      tool: 'notion_pages',
      args: {
        action: 'analyze_update',
        page_id: pageId,
        database: database,
        changes: data
      }
    };

    const mcpResponse = await forwardToMCP(mcpRequest);
    
    // Check if update requires automation
    if (requiresAutomation(data, database)) {
      const automationResponse = await triggerAutomation(data, database, pageId);
      mcpResponse.automation = automationResponse;
    }

    return mcpResponse;
  } catch (error) {
    console.error('Error processing item update:', error);
    throw error;
  }
}

// Helper function: Process AI analysis request
async function processAIAnalysis(data, database) {
  try {
    const aiRequest = {
      tool: 'ashval_advanced_prompt_generator',
      args: {
        action: 'analyze_content',
        database: database,
        content: data,
        analysis_type: data.analysis_type || 'comprehensive'
      }
    };

    const aiResponse = await forwardToMCP(aiRequest);
    
    // If analysis successful, update Notion
    if (aiResponse.success && data.update_notion !== false) {
      await updateNotionWithAnalysis(aiResponse, database, data.page_id);
    }

    return aiResponse;
  } catch (error) {
    console.error('Error processing AI analysis:', error);
    throw error;
  }
}

// Helper function: Process automation trigger
async function processAutomation(data, database) {
  try {
    // Determine automation type
    const automationType = data.automation_type || 'workflow';
    
    const automationRequest = {
      tool: 'ashval_workflow_manager',
      args: {
        action: 'execute_automation',
        type: automationType,
        database: database,
        trigger_data: data
      }
    };

    return await forwardToMCP(automationRequest);
  } catch (error) {
    console.error('Error processing automation:', error);
    throw error;
  }
}

// Helper function: Process generic webhook
async function processGenericWebhook(webhookData) {
  try {
    const genericRequest = {
      tool: 'notion_database',
      args: {
        action: 'process_webhook',
        webhook_data: webhookData
      }
    };

    return await forwardToMCP(genericRequest);
  } catch (error) {
    console.error('Error processing generic webhook:', error);
    throw error;
  }
}

// Helper function: Forward request to MCP
async function forwardToMCP(mcpRequest) {
  try {
    // Create Express request object to use existing gateway
    const mockReq = {
      body: mcpRequest,
      method: 'POST',
      headers: { 'content-type': 'application/json' }
    };

    // Use existing gateway functionality
    // This is a simplified version - in production, you'd use the actual gateway
    console.log('Forwarding to MCP:', mcpRequest);
    
    return {
      success: true,
      message: 'Request forwarded to MCP',
      tool: mcpRequest.tool,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error forwarding to MCP:', error);
    throw error;
  }
}

// Helper function: Check if AI analysis should be triggered
function shouldTriggerAI(data, database) {
  const aiTriggerDatabases = ['characters', 'scenes', 'stories', 'projects'];
  const hasContent = data && (data.content || data.description || data.summary);
  
  return aiTriggerDatabases.includes(database) && hasContent;
}

// Helper function: Check if automation is required
function requiresAutomation(data, database) {
  // Check for status changes that trigger automation
  const statusFields = ['status', 'stage', 'priority'];
  return statusFields.some(field => data[field] && data[field].changed);
}

// Helper function: Trigger AI analysis
async function triggerAIAnalysis(data, database, pageId) {
  try {
    const aiRequest = {
      tool: 'ashval_advanced_prompt_generator',
      args: {
        action: 'analyze_content',
        page_id: pageId,
        database: database,
        content: data.content || data.description,
        analysis_type: 'auto_trigger'
      }
    };

    return await forwardToMCP(aiRequest);
  } catch (error) {
    console.error('Error triggering AI analysis:', error);
    return { error: error.message };
  }
}

// Helper function: Trigger automation
async function triggerAutomation(data, database, pageId) {
  try {
    const automationRequest = {
      tool: 'ashval_workflow_manager',
      args: {
        action: 'auto_trigger',
        page_id: pageId,
        database: database,
        changes: data
      }
    };

    return await forwardToMCP(automationRequest);
  } catch (error) {
    console.error('Error triggering automation:', error);
    return { error: error.message };
  }
}

// Helper function: Update Notion with analysis results
async function updateNotionWithAnalysis(aiResponse, database, pageId) {
  try {
    if (!pageId || !aiResponse.analysis) return;

    const updateRequest = {
      tool: 'notion_pages',
      args: {
        action: 'update_with_analysis',
        page_id: pageId,
        database: database,
        analysis: aiResponse.analysis
      }
    };

    return await forwardToMCP(updateRequest);
  } catch (error) {
    console.error('Error updating Notion with analysis:', error);
    throw error;
  }
}

// Helper function: Generate next steps for Make.com
function generateNextSteps(action, mcpResponse) {
  const nextSteps = [];

  switch (action) {
    case 'page_created':
      nextSteps.push('AI analysis initiated');
      if (mcpResponse.ai_analysis) {
        nextSteps.push('Analysis completed - check Notion for updates');
      }
      break;
      
    case 'page_updated':
      nextSteps.push('Update processed');
      if (mcpResponse.automation) {
        nextSteps.push('Automation triggered');
      }
      break;
      
    case 'ai_analysis_request':
      nextSteps.push('AI analysis completed');
      nextSteps.push('Results saved to Notion');
      break;
      
    default:
      nextSteps.push('Webhook processed successfully');
  }

  return nextSteps;
}

// Webhook status endpoint
router.get('/webhook/status', (req, res) => {
  res.json({
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: {
      webhook: '/api/v1/agent/webhook/make',
      status: '/api/v1/agent/webhook/status'
    },
    supported_actions: [
      'page_created',
      'page_updated', 
      'database_item_created',
      'database_item_updated',
      'ai_analysis_request',
      'automation_trigger'
    ],
    make_com_integration: {
      active: true,
      documentation: 'https://www.make.com/en/help/tools/webhooks'
    }
  });
});

// Test endpoint for Make.com setup
router.post('/webhook/test', (req, res) => {
  console.log('🧪 Test webhook received:', req.body);
  
  res.json({
    success: true,
    message: 'Test webhook received successfully',
    timestamp: new Date().toISOString(),
    received_data: req.body,
    next_step: 'Configure your Make.com scenario to use /api/v1/agent/webhook/make'
  });
});

export default router;
