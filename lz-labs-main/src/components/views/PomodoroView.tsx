

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { POMODORO_DEFAULT_SETTINGS, POMODORO_SESSIONS_STORAGE_KEY, POMODORO_SETTINGS_STORAGE_KEY, APP_TITLE } from '../../../constants';
import Icon from '../Icon';

type PomodoroSessionType = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  pomodorosPerCycle: number;
}

const PomodoroView: React.FC = () => {
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    const savedSettings = localStorage.getItem(POMODORO_SETTINGS_STORAGE_KEY);
    return savedSettings ? JSON.parse(savedSettings) : POMODORO_DEFAULT_SETTINGS;
  });

  const [timeRemaining, setTimeRemaining] = useState(settings.workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSessionType, setCurrentSessionType] = useState<PomodoroSessionType>('work');
  const [pomodorosCompletedThisCycle, setPomodorosCompletedThisCycle] = useState(0);
  const [totalPomodorosToday, setTotalPomodorosToday] = useState(() => {
    const today = new Date().toDateString();
    const savedSessions = localStorage.getItem(POMODORO_SESSIONS_STORAGE_KEY);
    if (savedSessions) {
      const data = JSON.parse(savedSessions);
      return data.date === today ? data.count : 0;
    }
    return 0;
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState<PomodoroSettings>(settings);

  const intervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const audioCtx = audioContextRef.current;
    if (!audioCtx || audioCtx.state === 'suspended') {
        audioCtx?.resume(); // Attempt to resume if suspended (e.g., due to autoplay policies)
    }
    if (!audioCtx) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Adjust volume
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3); // Beep duration
  }, []);

  const resetTimer = useCallback((sessionType: PomodoroSessionType, newPomodorosInCycle = pomodorosCompletedThisCycle) => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentSessionType(sessionType);
    setPomodorosCompletedThisCycle(newPomodorosInCycle);

    switch (sessionType) {
      case 'work':
        setTimeRemaining(settings.workMinutes * 60);
        break;
      case 'shortBreak':
        setTimeRemaining(settings.shortBreakMinutes * 60);
        break;
      case 'longBreak':
        setTimeRemaining(settings.longBreakMinutes * 60);
        break;
    }
  }, [settings, pomodorosCompletedThisCycle]);

  const advanceSession = useCallback(() => {
    playBeep();
    if (currentSessionType === 'work') {
      const newTotalPomodoros = totalPomodorosToday + 1;
      setTotalPomodorosToday(newTotalPomodoros);
      localStorage.setItem(POMODORO_SESSIONS_STORAGE_KEY, JSON.stringify({ date: new Date().toDateString(), count: newTotalPomodoros }));
      
      const newCompletedInCycle = pomodorosCompletedThisCycle + 1;
      if (newCompletedInCycle >= settings.pomodorosPerCycle) {
        resetTimer('longBreak', 0); // Reset cycle count
      } else {
        resetTimer('shortBreak', newCompletedInCycle);
      }
    } else { // shortBreak or longBreak
      resetTimer('work');
    }
  }, [currentSessionType, pomodorosCompletedThisCycle, settings, resetTimer, totalPomodorosToday, playBeep]);


  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            advanceSession();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, advanceSession]);
  
  useEffect(() => { // Update timer when settings change and not running
    if (!isRunning) {
       resetTimer(currentSessionType);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const sessionTypeLabel: Record<PomodoroSessionType, string> = {
    work: 'Work Session',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
  };

  // Dynamic Document Title
  useEffect(() => {
    if (isRunning) {
      document.title = `${formatTime(timeRemaining)} - ${sessionTypeLabel[currentSessionType]} | ${APP_TITLE}`;
    } else {
      document.title = `Pomodoro Timer | ${APP_TITLE}`;
    }
    // Cleanup function to reset title when component unmounts or view changes
    return () => {
      document.title = APP_TITLE;
    };
  }, [isRunning, timeRemaining, currentSessionType]);
  
  const handleSaveSettings = () => {
    setSettings(tempSettings);
    localStorage.setItem(POMODORO_SETTINGS_STORAGE_KEY, JSON.stringify(tempSettings));
    setIsSettingsOpen(false);
    if (!isRunning) {
        resetTimer(currentSessionType, pomodorosCompletedThisCycle);
    }
  };
  
  const progressPercentage = () => {
    let totalDuration;
    switch (currentSessionType) {
      case 'work': totalDuration = settings.workMinutes * 60; break;
      case 'shortBreak': totalDuration = settings.shortBreakMinutes * 60; break;
      case 'longBreak': totalDuration = settings.longBreakMinutes * 60; break;
      default: totalDuration = 1; 
    }
    if (totalDuration === 0) return 0; // Avoid division by zero
    return ((totalDuration - timeRemaining) / totalDuration) * 100;
  };

  const getTimerCardBackground = () => {
    switch (currentSessionType) {
      case 'work':
        return 'bg-bg';
      case 'shortBreak':
        return 'bg-success-bg dark:bg-success-dark-bg border border-success dark:border-success-dark';
      case 'longBreak':
        return 'bg-info-bg dark:bg-info-dark-bg border border-info dark:border-info-dark';
      default:
        return 'bg-bg';
    }
  };

  const btnBase = "px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  const btnPrimary = `${btnBase} bg-primary text-white hover:bg-primary-hover active:scale-95`;
  const btnSecondary = `${btnBase} bg-surface text-text-primary hover:bg-border active:scale-95 border border-border`;
  const btnDanger = `${btnBase} bg-error text-white hover:opacity-90 active:scale-95`;
  const btnIcon = `${btnBase} p-0 w-9 h-9 text-text-secondary hover:bg-surface active:scale-95`;

  return (
    <div className="flex flex-col items-center justify-center h-full text-text-primary animate-fade-in p-4">
      <div className={`card p-6 md:p-10 w-full max-w-md text-center transition-colors duration-500 ${getTimerCardBackground()}`}>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold text-text-secondary">{sessionTypeLabel[currentSessionType]}</h1>
            <button 
                onClick={() => { 
                    setTempSettings(settings); // Ensure temp settings are current before opening
                    setIsSettingsOpen(true);
                }} 
                className={btnIcon}
                title="ตั้งค่า"
                aria-label="เปิดการตั้งค่า Pomodoro"
            >
                <Icon name="settings" />
            </button>
        </div>

        <div className="relative w-48 h-48 md:w-60 md:h-60 mx-auto mb-8">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                    className="text-border"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="42"
                    cx="50"
                    cy="50"
                />
                <circle
                    className="text-primary"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={(2 * Math.PI * 42) * (1 - progressPercentage() / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="42"
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                    style={{transition: 'stroke-dashoffset 0.3s ease-out'}}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span 
                    className="text-4xl md:text-5xl font-bold tabular-nums"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {formatTime(timeRemaining)}
                </span>
            </div>
        </div>

        <div className="space-y-3 mb-8">
            <button
                onClick={() => setIsRunning(!isRunning)}
                className={`w-full py-3 text-lg ${isRunning ? btnDanger : btnPrimary}`}
                 aria-pressed={isRunning}
            >
                <Icon name={isRunning ? 'pause' : 'play'} className="w-4 h-4 mr-2" />
                {isRunning ? 'หยุดชั่วคราว' : 'เริ่ม'}
            </button>
            <div className="flex gap-3">
                <button
                    onClick={() => resetTimer(currentSessionType)}
                    className={`${btnSecondary} w-full`}
                >
                    <Icon name="undo" className="w-4 h-4 mr-2" />รีเซ็ต
                </button>
                 <button
                    onClick={advanceSession}
                    className={`${btnSecondary} w-full`}
                    title="ข้ามไปยังช่วงถัดไป"
                >
                    <Icon name="forward" className="w-4 h-4 mr-2" />ข้าม
                </button>
            </div>
        </div>
        
        <div className="space-y-1 text-sm text-text-secondary">
            <div className="flex items-center justify-center">
                <Icon name="tasks" className="w-4 h-4 mr-2 text-text-disabled" />
                <span>Cycle: {pomodorosCompletedThisCycle} / {settings.pomodorosPerCycle} Pomodoros</span>
            </div>
            <div className="flex items-center justify-center">
                <Icon name="calendar-day" className="w-4 h-4 mr-2 text-text-disabled" />
                <span>Today: {totalPomodorosToday} Pomodoros</span>
            </div>
        </div>

      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-bg card w-full max-w-md p-6 animate-scale-in">
            <h3 className="text-lg font-semibold mb-4 text-text-primary">ตั้งค่า Pomodoro</h3>
            <div className="space-y-3 text-sm">
                {[
                    {label: 'Work Minutes:', key: 'workMinutes', min:1, max:90}, 
                    {label: 'Short Break Minutes:', key: 'shortBreakMinutes', min:1, max:30},
                    {label: 'Long Break Minutes:', key: 'longBreakMinutes', min:1, max:60}, 
                    {label: 'Pomodoros per Cycle:', key: 'pomodorosPerCycle', min:1, max:10}
                ].map(item => (
                    <div key={item.key} className="flex justify-between items-center">
                        <label htmlFor={item.key} className="text-text-secondary">{item.label}</label>
                        <input
                            type="number"
                            id={item.key}
                            min={item.min}
                            max={item.max}
                            value={tempSettings[item.key as keyof PomodoroSettings]}
                            onChange={(e) => {
                                let val = parseInt(e.target.value);
                                if (isNaN(val)) val = 1;
                                setTempSettings({ ...tempSettings, [item.key as keyof PomodoroSettings]: Math.max(item.min, Math.min(item.max, val)) });
                            }}
                            className="w-20 p-1.5 bg-bg rounded-md border border-border text-center"
                        />
                    </div>
                ))}
            </div>
            <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => setIsSettingsOpen(false)} className={btnSecondary}>Cancel</button>
                <button onClick={handleSaveSettings} className={btnPrimary}>Save Settings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroView;
