

import React, { useMemo, useState, useEffect } from 'react';
import { ViewName, Note, Task, PlotPoint, DailyQuest, DictionaryEntry } from '../../../types';
import StatRingChart from '../charts/StatRingChart';
import Icon from '../Icon';
import {
    USER_NAME,
    DASHBOARD_QUICK_ACTIONS,
    DAILY_QUESTS,
    POMODORO_SESSIONS_STORAGE_KEY,
    DASHBOARD_CHARACTER_GOAL,
    DASHBOARD_PLOT_GOAL,
    DASHBOARD_TASK_GOAL,
    NOTE_CATEGORIES
} from '../../../constants';


const getCategoryDetails = (categoryKey: Note['category'] | undefined): (typeof NOTE_CATEGORIES)[number] => {
    return NOTE_CATEGORIES.find(cat => cat.key === (categoryKey || '')) || NOTE_CATEGORIES.find(cat => cat.key === '')!;
};


interface DashboardViewProps {
  onNavigate: (view: ViewName) => void;
  onQuickAction: (action: string) => void;
  notes: Note[];
  tasks: Task[];
  plotPoints: PlotPoint[];
  dictionary: DictionaryEntry[];
}

const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onQuickAction,
  notes,
  tasks,
  plotPoints,
  dictionary,
}) => {
    const [quests, setQuests] = useState<DailyQuest[]>(DAILY_QUESTS);

    const stats = useMemo(() => {
        const totalCharacters = notes.reduce((sum, note) => sum + note.characterCount, 0);
        const completedPlots = plotPoints.filter(p => p.status === 'completed').length;
        const completedTasks = tasks.filter(t => t.completed).length;

        return [
            { label: 'Characters', value: totalCharacters, goal: DASHBOARD_CHARACTER_GOAL, color: 'var(--c-primary)' },
            { label: 'Plots', value: completedPlots, goal: DASHBOARD_PLOT_GOAL, color: 'var(--c-secondary)' },
            { label: 'Tasks', value: completedTasks, goal: DASHBOARD_TASK_GOAL, color: 'var(--c-success)' }
        ];
    }, [notes, plotPoints, tasks]);

    const recentNotes = useMemo(() => {
        return [...notes]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 3);
    }, [notes]);
    
    useEffect(() => {
        // This effect simulates quest progress updates.
        const today = new Date().toDateString();
        const savedPomodoros = localStorage.getItem(POMODORO_SESSIONS_STORAGE_KEY);
        const pomosToday = savedPomodoros && JSON.parse(savedPomodoros).date === today ? JSON.parse(savedPomodoros).count : 0;
        const completedTasksToday = tasks.filter(t => t.completed && new Date(t.updatedAt).toDateString() === today).length;
        const charactersWrittenToday = notes
            .filter(n => new Date(n.updatedAt).toDateString() === today)
            .reduce((sum, n) => sum + n.characterCount, 0);

        setQuests(prevQuests => prevQuests.map(quest => {
            if (quest.id === 'quest1') return { ...quest, value: charactersWrittenToday };
            if (quest.id === 'quest2') return { ...quest, value: pomosToday };
            if (quest.id === 'quest3') return { ...quest, value: completedTasksToday };
            return quest;
        }));
    }, [notes, tasks]);


  return (
    <div className="space-y-6 text-text-primary animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">แดชบอร์ด</h1>
          <p className="text-text-secondary">ยินดีต้อนรับกลับมา, {USER_NAME}</p>
        </div>
      </div>
      
      {/* Main Dashboard Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Stat Ring Chart and Daily Quests */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-surface rounded-xl shadow-card p-6 flex flex-col items-center justify-center">
                    <StatRingChart series={stats} size={240} />
                </div>

                <div className="bg-surface rounded-xl shadow-card p-4">
                     <h3 className="text-lg font-semibold font-heading mb-4">ภารกิจประจำวัน</h3>
                     <div className="space-y-3">
                        {quests.map(quest => {
                            const progress = Math.min(100, (quest.value / quest.target) * 100);
                            return (
                                <div key={quest.id}>
                                    <div className="flex items-center text-sm mb-1">
                                        <Icon name={quest.icon} className="w-4 h-4 mr-2" style={{color: quest.color}} />
                                        <span className="font-medium flex-grow">{quest.title}</span>
                                        <span className="text-text-secondary">{quest.value}/{quest.target}</span>
                                    </div>
                                    <div className="w-full bg-bg-subtle rounded-full h-2">
                                        <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: quest.color }}></div>
                                    </div>
                                </div>
                            );
                        })}
                     </div>
                </div>
            </div>

            {/* Right Column: Quick Actions and Recent Notes */}
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-4"> 
                    {DASHBOARD_QUICK_ACTIONS.map(item => (
                    <button 
                        key={item.action}
                        onClick={() => onQuickAction(item.action)}
                        className="bg-surface p-4 flex flex-col items-center justify-center text-center rounded-xl shadow-sm border border-border hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                        <div className={`rounded-full w-12 h-12 ${item.iconBg} flex items-center justify-center mb-2`}> 
                          <Icon name={item.icon} className={`${item.iconColor} w-6 h-6`} />
                        </div>
                        <h3 className="font-medium font-heading text-sm">{item.title}</h3> 
                        <p className="text-xs text-text-secondary mt-0.5">{item.description}</p>
                    </button>
                    ))}
                </div>
                 <div className="bg-surface rounded-xl shadow-card p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold font-heading">โน้ตล่าสุด</h3>
                        <button onClick={() => onNavigate(ViewName.Notes)} className="text-sm font-medium text-primary hover:text-primary-hover">ดูทั้งหมด</button>
                    </div>
                    {recentNotes.length > 0 ? (
                        <div className="space-y-3">
                            {recentNotes.map((note) => {
                                const catDetails = getCategoryDetails(note.category);
                                return (
                                <div key={note.id} className="flex p-3 rounded-lg hover:bg-bg-subtle cursor-pointer transition-colors" onClick={() => onNavigate(ViewName.Notes)}>
                                    <span className="text-xl mr-3">{note.icon || <Icon name={catDetails.icon} />}</span>
                                    <div className="flex-grow min-w-0">
                                        <div className="font-medium truncate font-heading" title={note.title}>{note.title}</div>
                                        <div className="text-sm text-text-secondary flex items-center">
                                            <span className="mr-3">{note.characterCount.toLocaleString()} ตัวอักษร</span>
                                            <span className={`px-2 py-0.5 rounded-full ${catDetails.colorClasses.pillBg || ''} text-xs`}>{catDetails.label}</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-text-secondary flex-shrink-0 ml-2">{new Date(note.updatedAt).toLocaleDateString('th-TH', { day:'numeric', month:'short' })}</div>
                                </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-text-secondary text-center py-4">ยังไม่มีโน้ตในโปรเจกต์นี้</p>
                    )}
                </div>
            </div>
       </div>

    </div>
  );
};

export default DashboardView;
