import React, { useState, useEffect, useRef, useCallback } from 'react';
import { streamChatResponse, createProject, getProjects, getDatabases, createNote, getProjectNotes } from './services/notionMcpService';
import type { Message, Project, CustomTool, Datasource } from './types';
import { Role } from './types';
import Header from './components/Header';
import ChatBubble from './components/ChatBubble';
import MessageInput from './components/MessageInput';
import SettingsModal from './components/SettingsModal';
import ShareModal from './components/ShareModal';

// Utility to read file as Data URL
const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Dashboard Component for Database and Project Management
const Dashboard: React.FC<{
  projects: Project[];
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
}> = ({ projects, onSelectProject, onNewProject }) => {
  const [databases, setDatabases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dbData = await getDatabases();
        setDatabases(dbData.databases || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-zinc-400">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Project Overview */}
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">📝 โปรเจค</h3>
          <p className="text-2xl font-bold text-blue-400">{projects.length}</p>
          <p className="text-sm text-zinc-400">โปรเจคทั้งหมด</p>
          <button
            onClick={onNewProject}
            className="mt-2 w-full px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm"
          >
            สร้างโปรเจคใหม่
          </button>
        </div>

        {/* Database Overview */}
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">🗃️ ฐานข้อมูล</h3>
          <p className="text-2xl font-bold text-green-400">{databases.length}</p>
          <p className="text-sm text-zinc-400">ฐานข้อมูล Notion</p>
        </div>

        {/* AI Tools */}
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">🤖 AI Tools</h3>
          <p className="text-2xl font-bold text-purple-400">
            {projects.reduce((total, p) => total + p.tools.length, 0)}
          </p>
          <p className="text-sm text-zinc-400">เครื่องมือ AI</p>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-zinc-800/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">📂 โปรเจคล่าสุด</h3>
        <div className="space-y-2">
          {projects.slice(0, 5).map(project => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="flex items-center justify-between p-3 bg-zinc-700/50 rounded cursor-pointer hover:bg-zinc-700"
            >
              <div>
                <p className="font-medium">{project.name}</p>
                <p className="text-sm text-zinc-400">{project.messages.length} ข้อความ</p>
              </div>
              <i className="fa-solid fa-chevron-right text-zinc-400"></i>
            </div>
          ))}
        </div>
      </div>

      {/* Available Databases */}
      {databases.length > 0 && (
        <div className="bg-zinc-800/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">🗃️ ฐานข้อมูล Notion</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {databases.map((db, index) => (
              <div key={index} className="bg-zinc-700/50 rounded p-3">
                <p className="font-medium">{db.name}</p>
                <p className="text-sm text-zinc-400 truncate">{db.id}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Welcome screen for first-time users
const EmptyState: React.FC<{ onNewProject: () => void; onShowDashboard: () => void }> = ({ onNewProject, onShowDashboard }) => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-950 p-8 text-center">
    <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
      <i className="fa-solid fa-brain text-3xl"></i>
    </div>
    <h1 className="text-3xl font-bold text-white mb-2">ยินดีต้อนรับสู่ Notion MCP Assistant</h1>
    <p className="text-zinc-400 max-w-md mb-8">ผู้ช่วย AI ที่เชื่อมต่อกับ Notion และระบบต่างๆ เริ่มต้นด้วยการสร้างโปรเจคแรกหรือดูแดชบอร์ด</p>
    <div className="flex gap-4">
      <button
        onClick={onShowDashboard}
        className="px-6 py-3 text-lg font-semibold rounded-lg bg-zinc-700 hover:bg-zinc-600 transition-all transform hover:scale-105"
      >
        <i className="fa-solid fa-chart-line mr-2"></i>
        ดูแดชบอร์ด
      </button>
      <button
        onClick={onNewProject}
        className="px-6 py-3 text-lg font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 transition-all transform hover:scale-105 shadow-lg"
      >
        <i className="fa-solid fa-plus mr-2"></i>
        สร้างโปรเจคแรก
      </button>
    </div>
  </div>
);

// Sidebar component
const Sidebar: React.FC<{
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onShowDashboard: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  showDashboard: boolean;
}> = ({ projects, activeProjectId, onSelectProject, onNewProject, onShowDashboard, isSidebarOpen, onToggleSidebar, onOpenSettings, showDashboard }) => {
  return (
    <aside className={`absolute md:relative z-20 h-full bg-zinc-900 border-r border-zinc-800 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-72 flex-shrink-0 flex flex-col`}>
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center h-20 flex-shrink-0">
        <h2 className="text-lg font-semibold">เมนูหลัก</h2>
        <button onClick={onToggleSidebar} className="md:hidden text-zinc-400 hover:text-white" aria-label="Close sidebar">
          <i className="fa-solid fa-times"></i>
        </button>
      </div>

      <div className="p-3 space-y-2">
        <button
          onClick={() => {
            onShowDashboard();
            if (isSidebarOpen && window.innerWidth < 768) onToggleSidebar();
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            showDashboard ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-white'
          }`}
        >
          <i className="fa-solid fa-chart-line"></i>
          แดชบอร์ด
        </button>
        <button
          onClick={onNewProject}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-500 transition-colors"
        >
          <i className="fa-solid fa-plus"></i>
          สร้างโปรเจคใหม่
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="text-xs text-zinc-500 uppercase tracking-wide px-3 py-2">โปรเจค</div>
        {projects.map(project => (
          <a
            key={project.id}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectProject(project.id);
              if (isSidebarOpen && window.innerWidth < 768) {
                onToggleSidebar();
              }
            }}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              project.id === activeProjectId && !showDashboard
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-white'
            }`}
          >
            <i className="fa-regular fa-comments w-4 text-center"></i>
            <span className="truncate flex-1">{project.name}</span>
          </a>
        ))}
      </nav>

      <div className="p-3 border-t border-zinc-800">
        <a href="#" onClick={(e) => { e.preventDefault(); onOpenSettings(); }} className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-zinc-300 hover:bg-zinc-800/50 hover:text-white transition-colors">
          <i className="fa-solid fa-gear w-4 text-center"></i>
          <span>ตั้งค่าโครงการ</span>
        </a>
      </div>
    </aside>
  );
};

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [input, setInput] = useState('');
  const [fileToSend, setFileToSend] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith('#data=')) {
        const encodedData = decodeURIComponent(hash.substring(6));
        const jsonString = atob(encodedData);
        const sharedProject = JSON.parse(jsonString) as Project;

        setProjects([sharedProject]);
        setActiveProjectId(sharedProject.id);
        setIsReadOnly(true);
        setShowDashboard(false);
        if (window.innerWidth < 768) {
          setSidebarOpen(false);
        }
        return;
      }

      const savedProjects = localStorage.getItem('mcpChatProjects');
      const savedActiveId = localStorage.getItem('mcpActiveProjectId');

      if (savedProjects) {
        const parsedProjects = JSON.parse(savedProjects);
        if (parsedProjects.length > 0) {
          setProjects(parsedProjects);
          const activeExists = parsedProjects.some((p: Project) => p.id === savedActiveId);
          setActiveProjectId(activeExists ? savedActiveId : parsedProjects[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to load data from URL or localStorage", e);
      window.location.hash = '';
      localStorage.removeItem('mcpChatProjects');
      localStorage.removeItem('mcpActiveProjectId');
    }
  }, []);

  useEffect(() => {
    if (isReadOnly) return;

    if (projects.length > 0) {
      localStorage.setItem('mcpChatProjects', JSON.stringify(projects));
    } else {
      localStorage.removeItem('mcpChatProjects');
      localStorage.removeItem('mcpActiveProjectId');
    }
    if (activeProjectId) {
      localStorage.setItem('mcpActiveProjectId', activeProjectId);
    }
  }, [projects, activeProjectId, isReadOnly]);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [projects, activeProjectId, isLoading]);

  const activeProject = projects.find(p => p.id === activeProjectId);

  const handleNewProject = useCallback(async () => {
    const newProjectName = `โปรเจค ${projects.length + 1}`;
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: newProjectName,
      messages: [{
        id: 'init-' + Date.now(),
        role: Role.AI,
        text: `สวัสดีค่ะ! ยินดีต้อนรับสู่โปรเจค "${newProjectName}" 🎉\n\nฉันเป็น AI Assistant ที่เชื่อมต่อกับ Notion MCP Server ค่ะ สามารถช่วยคุณได้หลายอย่าง:\n\n• 💬 **สนทนาอัจฉริยะ** - ตอบคำถามและให้คำแนะนำ\n• 📝 **จัดการ Notion** - สร้าง อัปเดต ค้นหาข้อมูลในฐานข้อมูล\n• 🛠️ **เครื่องมือกำหนดเอง** - สร้างและใช้เครื่องมือเฉพาะงาน\n• 🤖 **AI Agents** - วิเคราะห์และประมวลผลข้อมูลซับซ้อน\n\nลองถามอะไรฉันดูสิคะ หรือไปที่ "ตั้งค่าโครงการ" เพื่อเพิ่มเครื่องมือและแหล่งข้อมูลค่ะ`,
      }],
      tools: [],
      datasources: [],
    };

    // Try to create project in Notion if possible
    try {
      await createProject(newProjectName, 'โปรเจคที่สร้างจาก MCP Assistant');
    } catch (error) {
      console.warn('Could not create project in Notion, using local storage only:', error);
    }

    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    setShowDashboard(false);
  }, [projects.length]);

  const handleChat = useCallback(async (currentMessages: Message[], tools: CustomTool[], datasources: Datasource[]) => {
    if (!activeProjectId) return;
    setIsLoading(true);

    let finalAiMessageId: string | null = null;

    try {
      for await (const chunk of streamChatResponse(currentMessages, projects, activeProjectId, tools, datasources)) {
        if (chunk.type === 'system') {
          const systemMessage: Message = { id: `system-${Date.now()}`, role: Role.SYSTEM, text: chunk.payload };
          setProjects(currentProjects => currentProjects.map(p => p.id === activeProjectId ? { ...p, messages: [...p.messages, systemMessage] } : p));
        } else if (chunk.type === 'text') {
          setProjects(currentProjects => currentProjects.map(p => {
            if (p.id !== activeProjectId) return p;
            if (!finalAiMessageId) {
              finalAiMessageId = `ai-${Date.now()}`;
              return { ...p, messages: [...p.messages, { id: finalAiMessageId, role: Role.AI, text: chunk.payload }] };
            }
            return { ...p, messages: p.messages.map(msg => msg.id === finalAiMessageId ? { ...msg, text: msg.text + chunk.payload } : msg) };
          }));
        }
      }
    } catch (error) {
      console.error("Streaming chat failed:", error);
      const errorMessage: Message = { id: `err-${Date.now()}`, role: Role.SYSTEM, text: "ขออภัยค่ะ มีบางอย่างผิดพลาดในการสื่อสารกับ MCP Server กรุณาตรวจสอบว่า server ทำงานอยู่หรือไม่" };
      setProjects(currentProjects => currentProjects.map(p => p.id === activeProjectId ? { ...p, messages: [...p.messages, errorMessage] } : p));
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId, projects]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || isReadOnly) return;
    const trimmedInput = input.trim();
    if (isLoading || (!trimmedInput && !fileToSend)) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: Role.USER,
      text: trimmedInput,
    };

    if (fileToSend) {
      userMessage.file = { name: fileToSend.name, type: fileToSend.type, dataUrl: await readFileAsDataURL(fileToSend) };
    }

    const updatedMessages = [...activeProject.messages, userMessage];
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, messages: updatedMessages } : p));

    setInput('');
    setFileToSend(null);

    handleChat(updatedMessages, activeProject.tools, activeProject.datasources);
  }, [input, fileToSend, isLoading, activeProjectId, activeProject, handleChat, isReadOnly]);

  const updateProjectProperty = (key: keyof Project, value: any) => {
    setProjects(projs => projs.map(p => p.id === activeProjectId ? { ...p, [key]: value } : p));
  }

  // Tool Management
  const handleAddTool = (newTool: Omit<CustomTool, 'id'>) => {
    if (!activeProject) return;
    const toolWithId = { ...newTool, id: `tool-${Date.now()}` };
    updateProjectProperty('tools', [...activeProject.tools, toolWithId]);
  }
  const handleUpdateTool = (updatedTool: CustomTool) => {
    if (!activeProject) return;
    updateProjectProperty('tools', activeProject.tools.map(t => t.id === updatedTool.id ? updatedTool : t));
  }
  const handleDeleteTool = (toolId: string) => {
    if (!activeProject) return;
    updateProjectProperty('tools', activeProject.tools.filter(t => t.id !== toolId));
  }
  const handleExportTools = () => {
    if (!activeProject) return;
    const dataStr = JSON.stringify(activeProject.tools, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${activeProject.name.replace(/\s/g, '_')}_tools.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  const handleImportTools = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTools = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedTools)) {
          updateProjectProperty('tools', importedTools);
        } else { alert('ไฟล์ไม่ถูกต้อง: ต้องเป็น JSON array ของ tools'); }
      } catch (error) { alert('ไม่สามารถอ่านไฟล์ JSON ได้'); console.error(error); }
    };
    reader.readAsText(file);
  };

  // Datasource Management
  const handleAddDatasource = (newDatasource: Omit<Datasource, 'id'>) => {
    if (!activeProject) return;
    const dsWithId = { ...newDatasource, id: `ds-${Date.now()}` };
    updateProjectProperty('datasources', [...activeProject.datasources, dsWithId]);
  }
  const handleUpdateDatasource = (updatedDatasource: Datasource) => {
    if (!activeProject) return;
    updateProjectProperty('datasources', activeProject.datasources.map(d => d.id === updatedDatasource.id ? updatedDatasource : d));
  }
  const handleDeleteDatasource = (datasourceId: string) => {
    if (!activeProject) return;
    const updatedTools = activeProject.tools.map(t => t.datasourceId === datasourceId ? { ...t, datasourceId: undefined } : t);
    updateProjectProperty('tools', updatedTools);
    updateProjectProperty('datasources', activeProject.datasources.filter(d => d.id !== datasourceId));
  }

  // Render empty state if no projects exist and not in read-only mode
  if (projects.length === 0 && !isReadOnly) {
    return <EmptyState onNewProject={handleNewProject} onShowDashboard={() => setShowDashboard(true)} />;
  }

  // Render read-only view for shared projects
  if (isReadOnly) {
    return (
      <div className="flex h-screen w-full bg-zinc-950">
        <div className="flex flex-col flex-1 min-w-0">
          <Header
            projectName={activeProject?.name || 'Shared Project'}
            onToggleSidebar={() => { }}
            isReadOnly={true}
          />
          <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
            <div className="container mx-auto max-w-4xl">
              {activeProject?.messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
            </div>
          </main>
          <footer className="container mx-auto max-w-4xl px-4 py-4 text-center text-zinc-500 text-sm">
            <p>คุณกำลังดูโปรเจกต์ที่แชร์มาในโหมดอ่านอย่างเดียว</p>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => { setActiveProjectId(id); setShowDashboard(false); }}
        onNewProject={handleNewProject}
        onShowDashboard={() => { setShowDashboard(true); setActiveProjectId(null); }}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        onOpenSettings={() => setSettingsOpen(true)}
        showDashboard={showDashboard}
      />
      <div className="flex flex-col flex-1 bg-zinc-950 min-w-0">
        <Header
          projectName={showDashboard ? 'แดชบอร์ด' : (activeProject?.name || '')}
          onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          onOpenShareModal={() => setShareModalOpen(true)}
        />
        <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto max-w-4xl">
            {showDashboard ? (
              <Dashboard
                projects={projects}
                onSelectProject={(id) => { setActiveProjectId(id); setShowDashboard(false); }}
                onNewProject={handleNewProject}
              />
            ) : (
              <>
                {activeProject?.messages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}
                {isLoading && (activeProject?.messages.length === 0 || activeProject?.messages[activeProject.messages.length - 1]?.role !== Role.AI) && (
                  <ChatBubble key="loading" message={{ id: 'loading', role: Role.AI, text: '<div class="flex items-center gap-2"><div class="w-2 h-2 bg-zinc-500 rounded-full animate-pulse"></div><div class="w-2 h-2 bg-zinc-500 rounded-full animate-pulse [animation-delay:0.2s]"></div><div class="w-2 h-2 bg-zinc-500 rounded-full animate-pulse [animation-delay:0.4s]"></div></div>' }} />
                )}
              </>
            )}
          </div>
        </main>
        {!showDashboard && (
          <footer className="container mx-auto max-w-4xl px-4">
            <MessageInput
              input={input}
              setInput={setInput}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              file={fileToSend}
              setFile={setFileToSend}
            />
          </footer>
        )}
      </div>
      {activeProject && <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        project={activeProject}
        onAddTool={handleAddTool}
        onUpdateTool={handleUpdateTool}
        onDeleteTool={handleDeleteTool}
        onExportTools={handleExportTools}
        onImportTools={handleImportTools}
        onAddDatasource={handleAddDatasource}
        onUpdateDatasource={handleUpdateDatasource}
        onDeleteDatasource={handleDeleteDatasource}
      />}
      {activeProject && <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
        project={activeProject}
      />}
    </div>
  );
};

export default App;
