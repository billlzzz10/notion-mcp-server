import type { Project, Message, CustomTool, Datasource } from "../types";

/**
 * สร้างข้อความสำหรับ AI Agent ผ่าน Notion MCP Server
 */
export async function* streamChatResponse(
  currentMessages: Message[],
  allProjects: Project[],
  activeProjectId: string,
  tools: CustomTool[],
  datasources: Datasource[]
): AsyncGenerator<{ type: 'system' | 'text', payload: string }> {

  // ส่งข้อความไปยัง MCP Gateway Agent API
  const response = await fetch('http://localhost:3001/api/v1/agent/process-command', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      command: currentMessages[currentMessages.length - 1]?.text || '',
      context: {
        messages: currentMessages,
        projects: allProjects,
        activeProjectId,
        tools,
        datasources
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    yield { type: 'system', payload: `ข้อผิดพลาดในการเชื่อมต่อกับ MCP Server: ${response.status} ${response.statusText}. ${errorText}` };
    return;
  }

  const result = await response.json();
  
  if (result.success) {
    // แสดงข้อมูลโมเดลที่ใช้
    if (result.modelInfo) {
      yield { 
        type: 'system', 
        payload: `🤖 ใช้โมเดล: ${result.modelInfo.selectedModel} (ความซับซ้อน: ${result.modelInfo.complexity}%)` 
      };
    }
    
    // แสดงผลลัพธ์จาก AI
    if (result.analysis) {
      yield { type: 'text', payload: result.analysis };
    } else if (result.response) {
      yield { type: 'text', payload: result.response };
    } else {
      yield { type: 'text', payload: 'ได้รับการตอบกลับจาก AI Agent แล้วค่ะ' };
    }
  } else {
    yield { type: 'system', payload: `เกิดข้อผิดพลาด: ${result.error || 'ไม่ทราบสาเหตุ'}` };
  }
}

/**
 * สร้างโปรเจคใหม่ใน Notion
 */
export async function createProject(name: string, description: string) {
  try {
    const response = await fetch('http://localhost:3001/api/v1/writer/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        status: 'active',
        priority: 'medium'
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

/**
 * ดึงรายการโปรเจค
 */
export async function getProjects() {
  try {
    const response = await fetch('http://localhost:3001/api/v1/writer/projects');
    return await response.json();
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

/**
 * ดึงข้อมูลฐานข้อมูล Notion
 */
export async function getDatabases() {
  try {
    const response = await fetch('http://localhost:3001/api/v1/databases');
    return await response.json();
  } catch (error) {
    console.error('Error fetching databases:', error);
    throw error;
  }
}

/**
 * เพิ่ม note ในโปรเจค
 */
export async function createNote(projectId: string, title: string, content: string) {
  try {
    const response = await fetch(`http://localhost:3001/api/v1/writer/projects/${projectId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        content,
        category: 'general'
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
}

/**
 * ดึงรายการ notes ในโปรเจค
 */
export async function getProjectNotes(projectId: string) {
  try {
    const response = await fetch(`http://localhost:3001/api/v1/writer/projects/${projectId}/notes`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching project notes:', error);
    throw error;
  }
}

/**
 * ดึงสถิติโปรเจค
 */
export async function getProjectStats(projectId: string) {
  try {
    const response = await fetch(`http://localhost:3001/api/v1/writer/projects/${projectId}/stats`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching project stats:', error);
    throw error;
  }
}
