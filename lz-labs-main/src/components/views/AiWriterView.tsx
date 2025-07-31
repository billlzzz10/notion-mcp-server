import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse, Part } from "@google/genai";
import { AiChatLog, AiPersonality, Note, NoteCategory } from '../../../types';
import ContextSelectorModal from '../ContextSelectorModal'; 
import AiMentorPanel from '../AiMentorPanel';
import { CORE_WRITING_PERSONALITIES } from '../../prompts';
import { getSafeHtml } from '../../../utils';
import Icon from '../Icon';
import html2canvas from 'html2canvas';
import GIF from 'gif.js.optimized';


interface AiWriterViewProps {
  defaultAiPersonalityId: string;
  notes: Note[]; 
  onOpenNoteEditor: (noteData?: Partial<Note> | Note) => void; 
}

interface StructuredNoteFromAI {
    title: string;
    category: NoteCategory | '';
    subtitle?: string;
    content: string;
    tags: string[];
}

const AiWriterView: React.FC<AiWriterViewProps> = ({
  defaultAiPersonalityId,
  notes,
  onOpenNoteEditor, 
}) => {
  const [messages, setMessages] = useState<AiChatLog[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [selectedAiPersonalityId, setSelectedAiPersonalityId] = useState<string>(defaultAiPersonalityId);
  
  const [isContextModalOpen, setIsContextModalOpen] = useState<boolean>(false);
  const [contextTextForNextMessage, setContextTextForNextMessage] = useState<string>('');
  const [selectedContextNotesCount, setSelectedContextNotesCount] = useState<number>(0);
  
  const [isCreatingNoteFromMessageId, setIsCreatingNoteFromMessageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'mentor'>('chat');
  const [isRecording, setIsRecording] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const ai = useRef(new GoogleGenAI({ apiKey: process.env.API_KEY! })).current;
  const gifRef = useRef<GIF | null>(null);
  const recordingIntervalRef = useRef<number | null>(null);
  const allAiPersonalities = useMemo(() => [...CORE_WRITING_PERSONALITIES], []);

  const currentPersonality = useMemo(() => {
    return allAiPersonalities.find(p => p.id === selectedAiPersonalityId) || allAiPersonalities.find(p => p.id === defaultAiPersonalityId) || allAiPersonalities[0];
  }, [selectedAiPersonalityId, defaultAiPersonalityId, allAiPersonalities]);

  useEffect(() => {
    if (currentPersonality) {
      const newChat = ai.chats.create({
        model: 'gemini-2.5-flash-preview-04-17',
        config: {
          systemInstruction: currentPersonality.systemInstruction,
          temperature: currentPersonality.temperature,
          topP: currentPersonality.topP,
          topK: currentPersonality.topK,
        },
      });
      setCurrentChat(newChat);
      setMessages([]); 
      setContextTextForNextMessage(''); 
      setSelectedContextNotesCount(0);
    }
  }, [currentPersonality, ai.chats]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, activeTab]); 

  const handleAddContext = (selectedNotes: Note[]) => {
    const combinedContext = selectedNotes.map(note => `หัวข้อ: ${note.title}\nเนื้อหา:\n${note.content}`).join('\n\n---\n\n');
    setContextTextForNextMessage(combinedContext);
    setSelectedContextNotesCount(selectedNotes.length);
    setIsContextModalOpen(false);
  };

  const structureTextForNote = useCallback(async (textToStructure: string): Promise<StructuredNoteFromAI | null> => {
    const categoriesForPrompt = ['character', 'place', 'event', 'world', 'plot', 'other'].join("', '");
    const structuringPrompt = `You are an expert AI assistant for a fiction writer. Your task is to meticulously analyze the provided text and transform it into a well-structured, actionable note in Thai. The output must be a valid JSON object.

Text to process:
---
${textToStructure}
---

Based on the text, generate the following JSON fields:
1.  \`title\`: A concise, descriptive, and engaging title for the note (string, Thai, max 60 characters).
2.  \`category\`: Determine the most appropriate category from this list: '${categoriesForPrompt}'. If ambiguous, use 'other'.
3.  \`subtitle\`: (Optional) A brief, informative subtitle.
4.  \`content\`: The main body of the note, reformatted into clear, well-structured Markdown.
5.  \`tags\`: Suggest 3-5 relevant keywords or tags (array of strings, Thai).

Important: Respond ONLY with the JSON object. Do not include any introductory/concluding text or markdown formatting.`;
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: structuringPrompt,
        config: { responseMimeType: "application/json", thinkingConfig: { thinkingBudget: 0 } }
      });
      let jsonStr = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) jsonStr = match[2].trim();
      return JSON.parse(jsonStr) as StructuredNoteFromAI;
    } catch (error) {
      console.error("Error structuring text for note:", error);
      return null;
    }
  }, [ai.models]);

  const handleCreateNoteFromMessage = useCallback(async (message: AiChatLog) => {
    if (!message.text || isCreatingNoteFromMessageId === message.id) return;
    setIsCreatingNoteFromMessageId(message.id);
    
    const structuredData = await structureTextForNote(message.text);
    if (structuredData && structuredData.title && structuredData.content) {
      onOpenNoteEditor({
        title: structuredData.title,
        category: structuredData.category || 'other',
        subtitle: structuredData.subtitle || '',
        content: structuredData.content,
        tags: structuredData.tags || [],
      });
    } else {
      alert("AI ไม่สามารถจัดรูปแบบข้อมูลได้ ลองสร้างโน้ตด้วยตนเอง");
      onOpenNoteEditor({
        title: `โน้ตจากแชท (${new Date().toLocaleTimeString('th-TH')})`,
        content: message.text,
        category: 'other',
        tags: [],
      });
    }
    setIsCreatingNoteFromMessageId(null);
  }, [structureTextForNote, onOpenNoteEditor, isCreatingNoteFromMessageId]);


  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading || !currentChat) return;

    let userMessageForDisplay = inputText;
    if (contextTextForNextMessage) {
      userMessageForDisplay = `[เอกสารอ้างอิง (${selectedContextNotesCount} รายการ)]:\n${contextTextForNextMessage.substring(0,150)}...\n\n[คำถามของฉัน]:\n${inputText}`;
    }
    
    const userMessage: AiChatLog = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userMessageForDisplay, 
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInputText = inputText; 
    setInputText('');
    setIsLoading(true);

    const aiMessageId = `ai-${Date.now()}`;
    setMessages(prev => [...prev, { 
        id: aiMessageId, 
        sender: 'ai', 
        text: '', 
        isLoading: true, 
        timestamp: new Date().toISOString(),
        aiModeId: currentPersonality.id 
    }]);

    const geminiParts: Part[] = [];
    if (contextTextForNextMessage) {
        geminiParts.push({ text: `เอกสารอ้างอิงที่เกี่ยวข้อง (โปรดใช้ข้อมูลนี้ในการตอบคำถาม):\n${contextTextForNextMessage}` });
    }
    
    geminiParts.push({ text: currentInputText });
    
    try {
      const stream = await currentChat.sendMessageStream({ message: geminiParts });
      let currentAiResponseText = '';
      for await (const chunk of stream) { 
        currentAiResponseText += chunk.text;
        setMessages(prev => prev.map(msg =>
          msg.id === aiMessageId ? { ...msg, text: currentAiResponseText, isLoading: true } : msg
        ));
      }
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId ? { ...msg, text: currentAiResponseText, isLoading: false } : msg
      ));
    } catch (error) {
      console.error("Error sending message to AI:", error);
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId ? { ...msg, text: "ขออภัย, เกิดข้อผิดพลาดในการสื่อสารกับ AI", isLoading: false, isError: true } : msg
      ));
    } finally {
      setIsLoading(false);
      setContextTextForNextMessage(''); 
      setSelectedContextNotesCount(0);
    }
  }, [inputText, isLoading, currentChat, currentPersonality, contextTextForNextMessage, selectedContextNotesCount]);

  const startRecording = useCallback(() => {
    if (!chatContainerRef.current) return;
    setIsRecording(true);
    const gif = new GIF({ workers: 2, quality: 10, workerScript: '/gif.worker.js' });
    gifRef.current = gif;
    recordingIntervalRef.current = window.setInterval(async () => {
      const canvas = await html2canvas(chatContainerRef.current!);
      gif.addFrame(canvas, { copy: true, delay: 1000 });
    }, 1000);
  }, []);

  const stopRecording = useCallback(() => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    setIsRecording(false);
    const gif = gifRef.current;
    if (gif) {
      gif.on('finished', (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai-chat-demo.gif';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
      gif.render();
    }
  }, []);

  const getTabClass = (tabName: 'chat' | 'mentor') => `px-4 py-2 font-medium text-sm rounded-md transition-colors flex items-center gap-2 ${activeTab === tabName ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface'}`;
  
  return (
    <>
      <div className="flex flex-col h-full bg-bg rounded-xl shadow-lg text-text-primary">
        {/* Header & Tool/Personality Selector */}
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center">
              <div className="relative mr-3 flex items-center justify-center w-12 h-12">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-md"></div>
                  <Icon name={currentPersonality?.icon || 'robot'} className="relative w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{currentPersonality?.name || 'AI Writer'}</h1>
                <p className="text-xs text-text-secondary">{currentPersonality?.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button 
                className="px-3 py-2 bg-surface text-text-secondary rounded-md hover:bg-border text-sm flex items-center gap-1.5"
                title="เพิ่มบริบทจากโน้ต"
                onClick={() => setIsContextModalOpen(true)}
              >
                <Icon name="paperclip" className="w-4 h-4" /> Context
              </button>
            </div>
          </div>

          <details open className="group">
            <summary className="list-none flex items-center justify-between cursor-pointer hover:bg-surface p-1 rounded-md">
              <h3 className="text-sm font-semibold text-text-secondary">AI Personalities</h3>
              <Icon name="chevron-down" className="w-3 h-3 text-text-secondary transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
              {allAiPersonalities.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedAiPersonalityId(tool.id)}
                  className={`p-3 rounded-lg text-left transition-all duration-200 ${selectedAiPersonalityId === tool.id ? 'bg-primary text-white shadow-md' : 'bg-surface hover:bg-border'}`}
                >
                  <Icon name={tool.icon} className="w-5 h-5 mb-1" />
                  <div className="font-medium text-xs">{tool.name}</div>
                </button>
              ))}
            </div>
          </details>
        </div>

        {/* Tab Selector */}
        <div className="p-2 border-b border-border flex items-center justify-center">
            <div className="flex items-center space-x-2 bg-surface p-1 rounded-lg border border-border">
                <button className={getTabClass('chat')} onClick={() => setActiveTab('chat')}>
                    <Icon name="comments" className="w-4 h-4" /> Chat
                </button>
                <button className={getTabClass('mentor')} onClick={() => setActiveTab('mentor')}>
                    <Icon name="star-half-alt" className="w-4 h-4" /> AI Mentor
                </button>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col overflow-hidden">
          {activeTab === 'chat' ? (
            <>
              <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex group animate-slide-in ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-2xl p-3 rounded-xl shadow relative ${
                        msg.sender === 'user' 
                        ? 'bg-primary text-white rounded-br-none' 
                        : `bg-surface text-text-primary rounded-bl-none ${msg.isError ? 'border border-error' : ''}`
                    }`}>
                      {msg.isLoading && msg.sender === 'ai' && msg.text === '' ? (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs opacity-75">AI กำลังพิมพ์</span>
                          <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse delay-75"></div>
                          <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse delay-150"></div>
                          <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse delay-300"></div>
                        </div>
                      ) : (
                        <div className="markdown-content text-sm" dangerouslySetInnerHTML={getSafeHtml(msg.text)} />
                      )}
                      <div className={`text-xs mt-1.5 ${msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-text-disabled'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {!msg.isLoading && msg.text.trim() && (
                        <button
                          onClick={() => handleCreateNoteFromMessage(msg)}
                          disabled={isCreatingNoteFromMessageId === msg.id}
                          className={`absolute -top-2 -right-2 p-1.5 w-7 h-7 bg-bg text-primary rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-primary-hover hover:text-white disabled:opacity-50 ${isCreatingNoteFromMessageId === msg.id ? 'animate-pulse-icon' : ''}`}
                          title="สร้างโน้ตจากข้อความนี้"
                        >
                          <Icon name="file-plus" className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {messages.length === 0 && !isLoading && (
                  <div className="text-center text-text-secondary pt-10">
                    <Icon name={currentPersonality?.icon || 'robot'} className="w-10 h-10 mb-3" />
                    <p>เริ่มการสนทนากับ {currentPersonality?.name || 'AI'}</p>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-border bg-paper-bg">
                {selectedContextNotesCount > 0 && (
                  <div className="mb-2 text-xs text-primary">
                    <Icon name="info-circle" className="w-3 h-3 mr-1" />
                    จะใช้บริบทจาก {selectedContextNotesCount} โน้ตในข้อความถัดไป
                    <button 
                      onClick={() => { setContextTextForNextMessage(''); setSelectedContextNotesCount(0); }} 
                      className="ml-2 text-error hover:underline text-xs"
                      title="ล้างบริบท"
                    >
                      (ล้าง)
                    </button>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey && !isLoading) { e.preventDefault(); handleSendMessage(); } }}
                    placeholder={`ส่งข้อความถึง ${currentPersonality?.name || 'AI'}...`}
                    className="flex-grow p-3 border border-border rounded-lg bg-bg text-text-primary focus:ring-primary focus:border-primary resize-none"
                    rows={Math.min(3, Math.max(1, inputText.split('\n').length))}
                    disabled={isLoading}
                    aria-label="กล่องข้อความ"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputText.trim()}
                    className="h-full px-4 py-3 text-white rounded-lg disabled:opacity-50 transition-colors btn-textured-primary"
                    aria-label="ส่งข้อความ"
                  >
                    {isLoading ? <Icon name="spinner" className="w-5 h-5 animate-spin" /> : <Icon name="paper-plane" className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <AiMentorPanel />
          )}
        </div>
      </div>
       {isContextModalOpen && (
          <div className="animate-modal-enter">
            <ContextSelectorModal
                isOpen={isContextModalOpen}
                onClose={() => setIsContextModalOpen(false)}
                notes={notes}
                onAddContext={handleAddContext}
            />
          </div>
      )}
      <div className="flex space-x-2 mb-2">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className="px-4 py-2 bg-green-500 text-white rounded"  
        >
          Record GIF
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Stop GIF
        </button>
      </div>
    </>
  );
};

export default AiWriterView;
