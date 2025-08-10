"""
Azure OpenAI Agent API for Notion MCP Server
FastAPI-based microservice for AI agent operations
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import asyncio
import os
import logging
from datetime import datetime
import json

# Azure OpenAI
from openai import AsyncAzureOpenAI
import httpx

# Configuration
from config import get_settings, Settings

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="Notion MCP Agent API",
    description="Azure OpenAI-powered agent API for Notion MCP Server",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class AgentRequest(BaseModel):
    prompt: str = Field(..., description="User prompt for the AI agent")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional context")
    max_tokens: Optional[int] = Field(default=1000, description="Maximum tokens in response")
    temperature: Optional[float] = Field(default=0.7, description="Response creativity (0.0-1.0)")
    system_message: Optional[str] = Field(default=None, description="System message for the agent")

class AgentResponse(BaseModel):
    response: str = Field(..., description="AI agent response")
    tokens_used: int = Field(..., description="Number of tokens consumed")
    model: str = Field(..., description="Model used for generation")
    timestamp: datetime = Field(default_factory=datetime.now)

class NotionAnalysisRequest(BaseModel):
    notion_content: str = Field(..., description="Notion page content to analyze")
    analysis_type: str = Field(..., description="Type of analysis (summary, questions, etc.)")
    
class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str
    azure_openai_status: str

# Dependency to get Azure OpenAI client
async def get_azure_openai_client(settings: Settings = Depends(get_settings)) -> AsyncAzureOpenAI:
    """Get Azure OpenAI client instance"""
    try:
        client = AsyncAzureOpenAI(
            api_key=settings.azure_openai_api_key,
            api_version=settings.azure_openai_api_version,
            azure_endpoint=settings.azure_openai_endpoint
        )
        return client
    except Exception as e:
        logger.error(f"Failed to create Azure OpenAI client: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize Azure OpenAI client"
        )

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check(settings: Settings = Depends(get_settings)):
    """Health check endpoint for Azure Container Apps"""
    azure_status = "healthy"
    
    try:
        # Test Azure OpenAI connection
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.azure_openai_endpoint}/openai/deployments?api-version={settings.azure_openai_api_version}",
                headers={"api-key": settings.azure_openai_api_key},
                timeout=5.0
            )
            if response.status_code != 200:
                azure_status = "unhealthy"
    except Exception as e:
        logger.warning(f"Azure OpenAI health check failed: {e}")
        azure_status = "unhealthy"
    
    return HealthResponse(
        status="healthy" if azure_status == "healthy" else "degraded",
        timestamp=datetime.now(),
        version="1.0.0",
        azure_openai_status=azure_status
    )

# Main agent endpoint
@app.post("/agent/chat", response_model=AgentResponse)
async def agent_chat(
    request: AgentRequest,
    client: AsyncAzureOpenAI = Depends(get_azure_openai_client),
    settings: Settings = Depends(get_settings)
):
    """Main agent chat endpoint using Azure OpenAI"""
    try:
        # Prepare messages
        messages = []
        
        if request.system_message:
            messages.append({"role": "system", "content": request.system_message})
        
        # Add context if provided
        if request.context:
            context_str = f"Context: {json.dumps(request.context, indent=2)}"
            messages.append({"role": "system", "content": context_str})
        
        messages.append({"role": "user", "content": request.prompt})
        
        # Call Azure OpenAI
        response = await client.chat.completions.create(
            model=settings.azure_openai_deployment_name,
            messages=messages,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0
        )
        
        # Extract response
        content = response.choices[0].message.content
        tokens_used = response.usage.total_tokens
        
        logger.info(f"Agent response generated: {tokens_used} tokens used")
        
        return AgentResponse(
            response=content,
            tokens_used=tokens_used,
            model=settings.azure_openai_deployment_name,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Error in agent chat: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate agent response: {str(e)}"
        )

# Notion content analysis endpoint
@app.post("/agent/analyze-notion")
async def analyze_notion_content(
    request: NotionAnalysisRequest,
    client: AsyncAzureOpenAI = Depends(get_azure_openai_client),
    settings: Settings = Depends(get_settings)
):
    """Analyze Notion page content using Azure OpenAI"""
    try:
        # Define analysis prompts based on type
        analysis_prompts = {
            "summary": "Summarize the following Notion page content in a clear and concise manner:",
            "questions": "Generate thoughtful questions based on the following Notion page content:",
            "keywords": "Extract key topics and keywords from the following Notion page content:",
            "action_items": "Identify action items and tasks from the following Notion page content:",
            "improvements": "Suggest improvements and enhancements for the following Notion page content:"
        }
        
        prompt = analysis_prompts.get(request.analysis_type, "Analyze the following Notion page content:")
        full_prompt = f"{prompt}\n\n{request.notion_content}"
        
        # Call Azure OpenAI
        response = await client.chat.completions.create(
            model=settings.azure_openai_deployment_name,
            messages=[
                {"role": "system", "content": "You are an expert analyst helping users understand and improve their Notion content."},
                {"role": "user", "content": full_prompt}
            ],
            max_tokens=1500,
            temperature=0.3
        )
        
        content = response.choices[0].message.content
        tokens_used = response.usage.total_tokens
        
        logger.info(f"Notion analysis completed: {request.analysis_type}, {tokens_used} tokens used")
        
        return {
            "analysis": content,
            "analysis_type": request.analysis_type,
            "tokens_used": tokens_used,
            "timestamp": datetime.now()
        }
        
    except Exception as e:
        logger.error(f"Error in Notion analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze Notion content: {str(e)}"
        )

# Batch processing endpoint
@app.post("/agent/batch-process")
async def batch_process_requests(
    requests: List[AgentRequest],
    client: AsyncAzureOpenAI = Depends(get_azure_openai_client),
    settings: Settings = Depends(get_settings)
):
    """Process multiple agent requests in batch"""
    if len(requests) > 10:  # Limit batch size
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Batch size limited to 10 requests"
        )
    
    try:
        # Process requests concurrently
        tasks = []
        for req in requests:
            task = process_single_request(req, client, settings)
            tasks.append(task)
        
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle responses and exceptions
        results = []
        for i, response in enumerate(responses):
            if isinstance(response, Exception):
                results.append({
                    "index": i,
                    "success": False,
                    "error": str(response)
                })
            else:
                results.append({
                    "index": i,
                    "success": True,
                    "response": response.dict()
                })
        
        return {
            "batch_results": results,
            "total_requests": len(requests),
            "successful": sum(1 for r in results if r["success"]),
            "failed": sum(1 for r in results if not r["success"])
        }
        
    except Exception as e:
        logger.error(f"Error in batch processing: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch processing failed: {str(e)}"
        )

async def process_single_request(
    request: AgentRequest,
    client: AsyncAzureOpenAI,
    settings: Settings
) -> AgentResponse:
    """Process a single agent request"""
    messages = [{"role": "user", "content": request.prompt}]
    
    if request.system_message:
        messages.insert(0, {"role": "system", "content": request.system_message})
    
    response = await client.chat.completions.create(
        model=settings.azure_openai_deployment_name,
        messages=messages,
        max_tokens=request.max_tokens,
        temperature=request.temperature
    )
    
    return AgentResponse(
        response=response.choices[0].message.content,
        tokens_used=response.usage.total_tokens,
        model=settings.azure_openai_deployment_name,
        timestamp=datetime.now()
    )

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url)
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url)
        }
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Notion MCP Agent API starting up...")
    logger.info(f"🔧 Environment: {os.getenv('PYTHON_ENV', 'development')}")
    logger.info(f"🌐 Port: {os.getenv('API_PORT', '8000')}")

# Root endpoint
@app.get("/")
async def root():
    return {
        "service": "Notion MCP Agent API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("API_PORT", "8000"))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        access_log=True
    )