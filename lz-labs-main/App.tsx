import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Header from './src/components/Header';
import Sidebar from './src/components/Sidebar';
import ProjectSelectorDropdown from './src/components/ProjectSelectorDropdown';
import MobileControls from './src/components/MobileControls';
import NoteEditorModal from './src/components/NoteEditorModal'; 
import Icon from './src/components/Icon';

import DashboardView from './src/components/views/DashboardView';
import GraphView from './src/components/views/GraphView';
import NotesView from './src/components/views/NotesView';
import AiWriterView from './src/components/views/AiWriterView';
import SettingsView from './src/components/views/SettingsView';
import TasksView from './src/components/views/TasksView';
import DictionaryView from './src/components/views/DictionaryView';
import LoreManagerView from './src/components/views/LoreManagerView';
import PomodoroView from './src/components/views/PomodoroView';
import StoryStructureGeneratorView from './src/components/views/StoryStructureGeneratorView'; 

import { ViewName, Note } from './types';
import { useProjects } from './src/contexts/ProjectContext';
import {
  DEFAULT_VIEW,
  DEFAULT_NOTE_STATUS,
  APP_TITLE,
  MAIN_NAVIGATION,
  TOOLS_NAVIGATION,
  SETTINGS_NAVIGATION,
} from './constants';
import { CORE_WRITING_PERSONALITIES, AI_FUNCTIONAL_TOOLS } from './prompts';


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewName>(() => {
    const savedView = localStorage.getItem('ashval_currentView');
    return (savedView ? JSON.parse(savedView) : DEFAULT_VIEW) as ViewName;
  });
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedDarkMode = localStorage.getItem('ashval_isDarkMode');
    if (savedDarkMode !== null) return JSON.parse(savedDarkMode);
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

    const allProjects = localStorage.getItem('ashval_projects') ? JSON.parse(localStorage.getItem('ashval_projects')!) : INITIAL_PROJECTS;
    if (savedProjectId && allProjects.find((p: Project) => p.id === savedProjectId)) {
        return savedProjectId;
    }
    return allProjects.length > 0 ? allProjects[0].id : ''; 
  });


  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState<boolean>(false);

  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('ashval_notes');
    return savedNotes ? JSON.parse(savedNotes) : INITIAL_NOTES;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('ashval_tasks');
    return savedTasks ? JSON.parse(savedTasks) : INITIAL_TASKS;
  });

  const [dictionaryEntries, setDictionaryEntries] = useState<DictionaryEntry[]>(() => {
    const savedEntries = localStorage.getItem('ashval_dictionary_entries');
    return savedEntries ? JSON.parse(savedEntries) : INITIAL_DICTIONARY_ENTRIES;
  });

  const [plotPoints, setPlotPoints] = useState<PlotPoint[]>(() => {
    const savedPlotPoints = localStorage.getItem('ashval_plot_points');
    return savedPlotPoints ? JSON.parse(savedPlotPoints) : INITIAL_PLOT_POINTS;
  });

  const [worldElements, setWorldElements] = useState<WorldElement[]>(() => {
    const savedWorldElements = localStorage.getItem('ashval_world_elements');
    return savedWorldElements ? JSON.parse(savedWorldElements) : INITIAL_WORLD_ELEMENTS;
  });

  const [defaultAiPersonalityId, setDefaultAiPersonalityId] = useState<string>(() => {
    const savedDefaultAiId = localStorage.getItem('ashval_defaultAiPersonalityId');
    return savedDefaultAiId ? JSON.parse(savedDefaultAiId) : DEFAULT_AI_PERSONALITY_ID;
  });

  const projectSelectorBtnRef = useRef<HTMLButtonElement>(null);
  const [isNoteEditorModalOpen, setIsNoteEditorModalOpen] = useState(false);
  const [noteDataForModal, setNoteDataForModal] = useState<Partial<Note> | null>(null);


  useEffect(() => {
    if(isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ashval_isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => { localStorage.setItem('ashval_currentView', JSON.stringify(currentView)); }, [currentView]);
  useEffect(() => { localStorage.setItem('ashval_projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('ashval_currentProjectId', currentProjectId); }, [currentProjectId]);
  useEffect(() => { localStorage.setItem('ashval_notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('ashval_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('ashval_dictionary_entries', JSON.stringify(dictionaryEntries)); }, [dictionaryEntries]);
  useEffect(() => { localStorage.setItem('ashval_plot_points', JSON.stringify(plotPoints)); }, [plotPoints]);
  useEffect(() => { localStorage.setItem('ashval_world_elements', JSON.stringify(worldElements)); }, [worldElements]);
  useEffect(() => { localStorage.setItem('ashval_defaultAiPersonalityId', JSON.stringify(defaultAiPersonalityId)); }, [defaultAiPersonalityId]);

  useEffect(() => {
    const allProjects = projects.length > 0 ? projects : INITIAL_PROJECTS;
    if (allProjects.length > 0) {
        if (!allProjects.find(p => p.id === currentProjectId)) {
            setCurrentProjectId(allProjects[0].id);
        }
    } else {
        // If there are no projects, clear the current project ID
        setCurrentProjectId('');
    }
  }, [projects, currentProjectId]);

  const handleNavigate = useCallback((view: ViewName) => {
    if (view === currentView) return;
    setIsAnimatingOut(true);
    setTimeout(() => {
        setCurrentView(view);
        setIsAnimatingOut(false);
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    }, 200); // Half of the animation duration
  }, [currentView]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleThemeToggle = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleProjectSelect = useCallback((projectId: string) => {
    setCurrentProjectId(projectId);
    setIsProjectDropdownOpen(false);
  }, []);

  const handleCreateNewProject = useCallback(() => {
    const newProjectName = prompt("ชื่อโปรเจกต์ใหม่:", `โปรเจกต์ ${projects.length + 1}`);
    if (newProjectName && newProjectName.trim() !== '') {
        const newProject: Project = {
            id: `project-${Date.now()}`,
            name: newProjectName.trim(),
            icon: 'book'
        };
        const updatedProjects = [...projects, newProject];
        setProjects(updatedProjects);
        setCurrentProjectId(newProject.id);
        alert(`สร้างโปรเจกต์ "${newProjectName}" และเลือกเป็นโปรเจกต์ปัจจุบันแล้ว`);
    }
    setIsProjectDropdownOpen(false);
  }, [projects]);


  const handleQuickAction = useCallback((action: ViewName | string) => {
    if (Object.values(ViewName).includes(action as ViewName)) {
        if (action === ViewName.Notes) {
            handleOpenNoteEditor();
        } else if (action === ViewName.Tasks) {
            handleNavigate(ViewName.Tasks);
        }
        else {
            handleNavigate(action as ViewName);
        }
    } else {
        alert(`การดำเนินการด่วน: ${action} - กำลังพัฒนา`);
    }
  }, [handleNavigate]);

  const getCurrentProject = (): Project | undefined => {
    return projects.find(p => p.id === currentProjectId);
  };
  
  const getSidebarNavConfig = useCallback(() => {
    const undefinedDictionaryCount = dictionaryEntries.filter(
        d => d.projectId === currentProjectId && d.definition.trim() === ''
    ).length;

    const navConfig = {
        main: MAIN_NAVIGATION,
        tools: TOOLS_NAVIGATION.map(item => 
            item.key === ViewName.Dictionary
            ? { ...item, notificationCount: undefinedDictionaryCount }
            : item
        ),
        settings: SETTINGS_NAVIGATION,
    };
    return navConfig;
  }, [dictionaryEntries, currentProjectId]);

  const handleOpenNoteEditor = useCallback((noteData?: Partial<Note> | Note) => {
    setNoteDataForModal(noteData || { category: '', projectId: currentProjectId, status: DEFAULT_NOTE_STATUS, revision: 0 }); 
    setIsNoteEditorModalOpen(true);
  }, [currentProjectId]);

  const handleCloseNoteEditor = useCallback(() => {
    setIsNoteEditorModalOpen(false);
    setNoteDataForModal(null);
  }, []);

  const handleSaveNoteFromModal = useCallback((noteDataToSave: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'projectId' | 'characterCount' | 'revision'> | Note) => {
      const generateDateTag = (revision: number): string => {
        const d = new Date();
        const yy = d.getFullYear().toString().slice(-2);
        const mm = (d.getMonth() + 1).toString().padStart(2, '0');
        const dd = d.getDate().toString().padStart(2, '0');
        const rev = revision.toString().padStart(2, '0');
        return `date:${yy}-${mm}-${dd}-${rev}`;
      };

      const tagsFromInput = 'tags' in noteDataToSave && Array.isArray(noteDataToSave.tags) ? noteDataToSave.tags : [];
      const userTags = tagsFromInput.filter(t => !t.startsWith('status:') && !t.startsWith('date:'));
      
      const contentToSave = ('content' in noteDataToSave ? noteDataToSave.content : '');
      const charCount = calculateCharacterCount(contentToSave);

      const finalCategory = ('category' in noteDataToSave ? noteDataToSave.category : '') || '';
      const catDetails = NOTE_CATEGORIES.find(c => c.key === finalCategory);
      
      if ('id' in noteDataToSave && noteDataToSave.id) { // UPDATE NOTE
        const originalNote = notes.find(n => n.id === noteDataToSave.id);
        const newRevision = (originalNote?.revision || 0) + 1;
        const newStatus = ('status' in noteDataToSave) ? noteDataToSave.status : (originalNote?.status || DEFAULT_NOTE_STATUS);
        
        const systemTags = [`status:${newStatus}`, generateDateTag(newRevision)];
        const finalTags = [...systemTags, ...userTags];

        setNotes(prevNotes =>
          prevNotes.map(note =>
            note.id === noteDataToSave.id
              ? {
                  ...note,
                  ...noteDataToSave,
                  icon: noteDataToSave.icon || catDetails?.icon || 'notes',
                  category: finalCategory,
                  characterCount: charCount,
                  updatedAt: new Date().toISOString(),
                  status: newStatus,
                  revision: newRevision,
                  tags: finalTags,
                }
              : note
          )
        );
      } else { // CREATE NEW NOTE
        const newRevision = 1;
        const newStatus = ('status' in noteDataToSave) ? noteDataToSave.status : DEFAULT_NOTE_STATUS;
        
        const systemTags = [`status:${newStatus}`, generateDateTag(newRevision)];
        const finalTags = [...systemTags, ...userTags];
        
        const newNote: Note = {
          id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          projectId: currentProjectId,
          icon: ('icon' in noteDataToSave ? noteDataToSave.icon : '') || catDetails?.icon || 'notes',
          title: ('title' in noteDataToSave ? noteDataToSave.title : '') || 'โน้ตไม่มีชื่อ',
          subtitle: ('subtitle' in noteDataToSave ? noteDataToSave.subtitle : ''),
          category: finalCategory,
          noteType: ('noteType' in noteDataToSave ? noteDataToSave.noteType : 'Note'),
          content: contentToSave,
          tags: finalTags,
          characterCount: charCount,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          yamlFrontmatter: ('yamlFrontmatter'in noteDataToSave ? noteDataToSave.yamlFrontmatter : undefined),
          links: [],
          status: newStatus,
          revision: newRevision,
        };
        setNotes(prevNotes => [newNote, ...prevNotes]);
      }
      handleCloseNoteEditor();
  }, [currentProjectId, handleCloseNoteEditor, notes]);

  const handleAddLinkToNote = useCallback((sourceNoteId: string, targetItemId: string, relationshipType: LinkRelationshipType | string) => {
    setNotes(prevNotes => 
      prevNotes.map(note => {
        if (note.id === sourceNoteId) {
          const newLink: GraphLink = { targetId: targetItemId, type: relationshipType };
          const updatedLinks = [...(note.links || []), newLink];
          return { ...note, links: updatedLinks, updatedAt: new Date().toISOString() };
        }
        return note;
      })
    );
  }, []);


  const addMultipleNotes = useCallback((notesToAdd: Note[]) => {
    setNotes(prevNotes => {
      const existingNoteIds = new Set(prevNotes.map(n => n.id));
      const newNotesWithDetails = notesToAdd.map(note => {
        let uniqueId = note.id && !existingNoteIds.has(note.id) 
          ? note.id 
          : `imported-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        while (existingNoteIds.has(uniqueId)) {
          uniqueId = `imported-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-dup`;
        }
        
        return { 
          ...note, 
          id: uniqueId,
          projectId: currentProjectId, 
          characterCount: calculateCharacterCount(note.content),
          createdAt: note.createdAt || new Date().toISOString(),
          updatedAt: note.updatedAt || new Date().toISOString(),
          status: note.status || DEFAULT_NOTE_STATUS,
          revision: note.revision || 1,
          links: note.links || [],
        };
      });
      return [...newNotesWithDetails, ...prevNotes];
    });
  }, [currentProjectId]);
  
  const deleteNote = useCallback((noteId: string) => { 
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
  }, []);


  const addTask = useCallback((newTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>, projectId: string) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      projectId: projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
  }, []);

  const updateTask = useCallback((updatedTaskData: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === updatedTaskData.id
          ? { ...updatedTaskData, updatedAt: new Date().toISOString() }
          : task
      )
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  }, []);

  const toggleTaskCompletion = useCallback((taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
          : task
      )
    );
  }, []);

  const addDictionaryEntry = useCallback((newEntryData: Omit<DictionaryEntry, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>, projectId: string) => {
    const newEntry: DictionaryEntry = {
      ...newEntryData,
      id: `dict-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      projectId: projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isVerified: newEntryData.definition.trim() !== '',
    };
    setDictionaryEntries(prevEntries => [newEntry, ...prevEntries]);
  }, []);

  const updateDictionaryEntry = useCallback((updatedEntryData: DictionaryEntry) => {
    setDictionaryEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.id === updatedEntryData.id
          ? { ...updatedEntryData, updatedAt: new Date().toISOString(), isVerified: updatedEntryData.definition.trim() !== '' }
          : entry
      )
    );
  }, []);

  const deleteDictionaryEntry = useCallback((entryId: string) => {
    setDictionaryEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryId));
  }, []);

  const addPlotPoint = useCallback((newPlotPointData: Omit<PlotPoint, 'id' | 'createdAt' | 'updatedAt' | 'projectId' | 'order' | 'status'> & { status?: PlotPointStatus }) => {
    const newPlotPoint: PlotPoint = {
      title: newPlotPointData.title,
      description: newPlotPointData.description,
      type: newPlotPointData.type,
      id: `plot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      projectId: currentProjectId,
      order: (plotPoints.filter(p => p.projectId === currentProjectId).length || 0) + 1,
      status: newPlotPointData.status || DEFAULT_PLOT_POINT_STATUS,
      relatedNotes: newPlotPointData.relatedNotes || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPlotPoints(prevPlotPoints => [newPlotPoint, ...prevPlotPoints]);
  }, [currentProjectId, plotPoints]);

  const addMultiplePlotPoints = useCallback((plotPointsToAdd: Omit<PlotPoint, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>[]) => {
    setPlotPoints(prevPlotPoints => {
      const existingPlotPointIds = new Set(prevPlotPoints.map(p => p.id));
      let currentMaxOrder = prevPlotPoints.filter(p => p.projectId === currentProjectId).reduce((max, p) => Math.max(max, p.order), 0);

      const newPlotPointsWithDetails = plotPointsToAdd.map(pp => {
        let newId = `plot-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        while (existingPlotPointIds.has(newId)) {
          newId = `plot-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-gen`;
        }
        currentMaxOrder++;
        return {
          ...pp,
          id: newId,
          projectId: currentProjectId,
          order: currentMaxOrder,
          status: ('status' in pp ? pp.status : DEFAULT_PLOT_POINT_STATUS) as PlotPointStatus,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
      return [...prevPlotPoints, ...newPlotPointsWithDetails].sort((a,b) => a.order - b.order);
    });
  }, [currentProjectId]);

  const updatePlotPoint = useCallback((updatedPlotPointData: PlotPoint) => {
    setPlotPoints(prevPlotPoints =>
      prevPlotPoints.map(pp =>
        pp.id === updatedPlotPointData.id
          ? { ...updatedPlotPointData, updatedAt: new Date().toISOString() }
          : pp
      ).sort((a,b) => a.order - b.order)
    );
  }, []);

  const deletePlotPoint = useCallback((plotPointId: string) => {
    setPlotPoints(prevPlotPoints => prevPlotPoints.filter(pp => pp.id !== plotPointId));
  }, []);

  const addWorldElement = useCallback((newWorldElementData: Omit<WorldElement, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>) => {
    const newWorldElement: WorldElement = {
      ...newWorldElementData,
      id: `world-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      projectId: currentProjectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setWorldElements(prevWorldElements => [newWorldElement, ...prevWorldElements]);
  }, [currentProjectId]);

  const updateWorldElement = useCallback((updatedWorldElementData: WorldElement) => {
    setWorldElements(prevWorldElements =>
      prevWorldElements.map(we =>
        we.id === updatedWorldElementData.id
          ? { ...updatedWorldElementData, updatedAt: new Date().toISOString() }
          : we
      )
    );
  }, []);

  const deleteWorldElement = useCallback((worldElementId: string) => {
    setWorldElements(prevWorldElements => prevWorldElements.filter(we => we.id !== worldElementId));
  }, []);


  const handleSetDefaultAiPersonalityId = useCallback((id: string) => {
    setDefaultAiPersonalityId(id);
  }, []);

  const renderView = () => {
    const notesForCurrentProject = notes.filter(n => n.projectId === currentProjectId);
    const tasksForCurrentProject = tasks.filter(t => t.projectId === currentProjectId);
    const plotPointsForCurrentProject = plotPoints.filter(p => p.projectId === currentProjectId);
    const worldElementsForCurrentProject = worldElements.filter(w => w.projectId === currentProjectId);
    const dictionaryEntriesForCurrentProject = dictionaryEntries.filter(d => d.projectId === currentProjectId);
    const allAiPersonalities = [...CORE_WRITING_PERSONALITIES, ...AI_FUNCTIONAL_TOOLS];

    const allItemsForGraph = {
        notes: notesForCurrentProject,
        plotPoints: plotPointsForCurrentProject,
        worldElements: worldElementsForCurrentProject,
    };

    switch (currentView) {
      case ViewName.Dashboard:
        return <DashboardView
                  onNavigate={handleNavigate}
                  onQuickAction={handleQuickAction}
                  notes={notesForCurrentProject}
                  tasks={tasksForCurrentProject}
                  plotPoints={plotPointsForCurrentProject}
                  dictionary={dictionaryEntriesForCurrentProject}
                />;
      case ViewName.Notes:
        return <NotesView
                  notes={notes} 
                  currentProjectId={currentProjectId}
                  onOpenNoteEditor={handleOpenNoteEditor} 
                  deleteNote={deleteNote} 
                  onNavigate={handleNavigate}
                  addMultipleNotes={addMultipleNotes} 
                />;
      case ViewName.Tasks:
        return <TasksView
                  currentProjectId={currentProjectId}
                  tasks={tasks}
                  addTask={addTask}
                  updateTask={updateTask}
                  deleteTask={deleteTask}
                  toggleTaskCompletion={toggleTaskCompletion}
                />;
      case ViewName.AiWriter:
        return <AiWriterView
                  defaultAiPersonalityId={defaultAiPersonalityId}
                  notes={notesForCurrentProject}
                  onOpenNoteEditor={handleOpenNoteEditor} 
                />;
      case ViewName.GraphView:
        return <GraphView 
                  notes={notesForCurrentProject} 
                  plotPoints={plotPointsForCurrentProject}
                  worldElements={worldElementsForCurrentProject}
                  allItems={allItemsForGraph}
                  onOpenNoteEditor={handleOpenNoteEditor}
                  onNavigate={handleNavigate}
                  onAddLink={handleAddLinkToNote}
                />;
      case ViewName.Settings:
        return <SettingsView
                  defaultAiPersonalityId={defaultAiPersonalityId}
                  onSetDefaultAiPersonalityId={handleSetDefaultAiPersonalityId}
                  allAiPersonalities={allAiPersonalities}
                />;
      case ViewName.Dictionary:
        return <DictionaryView
                  currentProjectId={currentProjectId}
                  dictionaryEntries={dictionaryEntriesForCurrentProject}
                  addDictionaryEntry={addDictionaryEntry}
                  updateDictionaryEntry={updateDictionaryEntry}
                  deleteDictionaryEntry={deleteDictionaryEntry}
                />;
      case ViewName.LoreManager:
        return <LoreManagerView
                  currentProjectId={currentProjectId}
                  plotPoints={plotPointsForCurrentProject}
                  addPlotPoint={addPlotPoint}
                  updatePlotPoint={updatePlotPoint}
                  deletePlotPoint={deletePlotPoint}
                  worldElements={worldElementsForCurrentProject}
                  addWorldElement={addWorldElement}
                  updateWorldElement={updateWorldElement}
                  deleteWorldElement={deleteWorldElement}
                  notes={notesForCurrentProject}
               />;
      case ViewName.Pomodoro:
        return <PomodoroView />;
      case ViewName.StoryStructureGenerator: 
        return <StoryStructureGeneratorView
                  currentProjectId={currentProjectId}
                  addMultiplePlotPoints={addMultiplePlotPoints}
                  onNavigate={handleNavigate}
                />;
      default:
        return <DashboardView
                  onNavigate={handleNavigate}
                  onQuickAction={handleQuickAction}
                  notes={notesForCurrentProject}
                  tasks={tasksForCurrentProject}
                  plotPoints={plotPointsForCurrentProject}
                  dictionary={dictionaryEntriesForCurrentProject}
                />;
    }
  };

  return (
    <div className={`app-wrapper min-h-screen flex flex-col bg-bg text-text-primary`}>
      <Header
        onSidebarToggle={toggleSidebar}
        currentProject={getCurrentProject()}
        onProjectSelectorToggle={(event) => {
            if (projectSelectorBtnRef.current !== event.currentTarget) {
                (projectSelectorBtnRef as React.MutableRefObject<HTMLButtonElement | null>).current = event.currentTarget;
            }
            setIsProjectDropdownOpen(prev => !prev);
        }}
        onThemeToggle={handleThemeToggle}
        onQuickAction={handleQuickAction}
        isDarkMode={isDarkMode}
      />
      {isProjectDropdownOpen && (
          <div className="animate-modal-enter">
            <ProjectSelectorDropdown
              isOpen={isProjectDropdownOpen}
              projects={projects}
              currentProjectId={currentProjectId}
              onSelectProject={handleProjectSelect}
              onClose={() => setIsProjectDropdownOpen(false)}
              onCreateNewProject={handleCreateNewProject}
              triggerRef={projectSelectorBtnRef}
            />
          </div>
      )}

      <Sidebar isOpen={sidebarOpen} currentView={currentView} onNavigate={handleNavigate} navConfig={getSidebarNavConfig()} />
      
      {isNoteEditorModalOpen && (
        <div className="animate-modal-enter">
          <NoteEditorModal
              isOpen={isNoteEditorModalOpen}
              noteToEdit={noteDataForModal}
              onClose={handleCloseNoteEditor}
              onSave={handleSaveNoteFromModal}
              currentProjectId={currentProjectId}
          />
        </div>
      )}

      <MobileControls onQuickAction={handleQuickAction} />

      <div className="pt-16 flex-grow flex flex-col">
        <main className="max-w-full md:max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 w-full flex-grow flex flex-col overflow-hidden">
          <div key={currentView} className={`flex-grow flex flex-col ${!isAnimatingOut ? 'animate-view-enter' : ''}`}>
            {projects.length === 0 && currentView !== ViewName.Settings ? (
              <div className="text-center py-16 md:py-20 bg-surface rounded-xl shadow-card border border-border">
                  <Icon name="book" className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                  <h2 className="text-xl md:text-2xl font-semibold font-heading text-text-primary mb-2">ยังไม่มีโปรเจกต์</h2>
                  <p className="text-text-secondary mb-6">กรุณาสร้างโปรเจกต์ใหม่เพื่อเริ่มต้นใช้งาน {APP_TITLE}</p>
                  <button
                      onClick={handleCreateNewProject}
                      className="px-6 py-3 rounded-md font-semibold transition-colors btn-textured-primary"
                  >
                      <Icon name="plus" className="w-4 h-4 mr-2" />สร้างโปรเจกต์ใหม่
                  </button>
              </div>
            ) : (
              renderView()
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
