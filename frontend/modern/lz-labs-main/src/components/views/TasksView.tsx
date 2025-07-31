

import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../../../types'; // Ensure Task type is imported
import Icon from '../Icon';

interface TasksViewProps {
  currentProjectId: string;
  tasks: Task[];
  addTask: (newTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>, projectId: string) => void;
  updateTask: (updatedTask: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
}

const TasksView: React.FC<TasksViewProps> = ({
  currentProjectId,
  tasks,
  addTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'completed'>('newest');
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTasks = tasks.filter(task => task.projectId === currentProjectId);
  
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortOrder === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else { // completed
      return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
    }
  });

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
  };

  const saveEdit = () => {
    if (editingTaskId && editingTaskTitle.trim()) {
      const taskToUpdate = tasks.find(t => t.id === editingTaskId);
      if (taskToUpdate) {
        updateTask({
          ...taskToUpdate,
          title: editingTaskTitle.trim(),
          updatedAt: new Date().toISOString()
        });
      }
      cancelEditing();
    }
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTaskTitle('');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask({
        title: newTaskTitle.trim(),
        completed: false
      }, currentProjectId);
      setNewTaskTitle('');
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบ Task นี้?')) {
      deleteTask(taskId);
    }
  };

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    cancelEditing();
  }, [currentProjectId]);
  
  const btnPrimary = "px-4 py-2 bg-primary text-white rounded-md font-semibold hover:bg-primary-hover active:scale-95 transition-all duration-200 flex items-center";

  return (
    <div className="flex flex-col h-full bg-bg text-text-primary rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-bg p-4 flex items-center justify-between border-b border-border">
        <h2 className="text-xl font-bold flex items-center">
          <Icon name="tasks" className="mr-2 text-primary" /> Tasks
        </h2>
        <div className="flex items-center">
          <span className="mr-2 text-sm text-text-secondary">เรียงลำดับ:</span>
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest' | 'completed')}
            className="bg-surface text-text-primary rounded px-2 py-1 text-sm border border-border focus:ring-2 focus:ring-primary"
          >
            <option value="newest">ใหม่ล่าสุด</option>
            <option value="oldest">เก่าที่สุด</option>
            <option value="completed">สถานะ</option>
          </select>
        </div>
      </div>

      {/* Add New Task Form */}
      <div className="p-4 border-b border-border">
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="เพิ่ม Task ใหม่..."
            className="flex-grow p-2.5 border border-border rounded-lg bg-surface text-text-primary focus:ring-primary focus:border-primary"
          />
          <button
            type="submit"
            className={btnPrimary}
          >
            <Icon name="plus" className="w-4 h-4 mr-1.5" /> เพิ่ม Task
          </button>
        </form>
      </div>

      {/* Task List */}
      <div className="flex-grow overflow-y-auto p-4">
        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 text-text-secondary">
            <div className="bg-surface p-6 rounded-full mb-4">
              <Icon name="tasks" className="w-8 h-8 text-text-disabled" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-text-primary">ยังไม่มี Task ในโปรเจกต์นี้</h3>
            <p className="mb-4">เริ่มต้นโดยการเพิ่ม Task แรกของคุณ</p>
            <button
              onClick={focusInput}
              className={btnPrimary}
            >
              <Icon name="plus" className="w-4 h-4 mr-1.5" /> สร้าง Task แรก
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {sortedTasks.map(task => (
              <li 
                key={task.id}
                className={`flex items-center justify-between p-3.5 rounded-lg transition-all duration-200 ${
                  task.completed 
                    ? 'bg-success-bg dark:bg-success-dark-bg opacity-70' 
                    : 'bg-surface hover:bg-border'
                }`}
              >
                <div className="flex items-center flex-grow min-w-0">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(task.id)}
                    className="task-checkbox h-5 w-5 text-primary rounded focus:ring-primary mr-3 flex-shrink-0"
                  />
                  
                  {editingTaskId === task.id ? (
                    <div className="flex flex-grow items-center gap-2">
                      <input
                        type="text"
                        value={editingTaskTitle}
                        onChange={(e) => setEditingTaskTitle(e.target.value)}
                        className="flex-grow p-2 border border-border rounded-md bg-bg text-text-primary"
                        autoFocus
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                      />
                      <button
                        onClick={saveEdit}
                        className="p-2 text-green-600 hover:text-green-700 active:scale-90 active:brightness-95"
                        aria-label="บันทึกการแก้ไข"
                      >
                        <Icon name="save" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-2 text-red-600 hover:text-red-700 active:scale-90 active:brightness-95"
                        aria-label="ยกเลิกการแก้ไข"
                      >
                        <Icon name="times" className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <span className={`truncate ${task.completed ? 'line-through text-text-disabled' : 'text-text-primary'}`}>
                        {task.title}
                      </span>
                      <p className="text-xs text-text-disabled mt-0.5">
                        สร้างเมื่อ: {new Date(task.createdAt).toLocaleDateString('th-TH', {day:'numeric', month:'short'})}
                      </p>
                    </div>
                  )}
                </div>
                
                {editingTaskId !== task.id && (
                  <div className="flex space-x-2 flex-shrink-0 ml-2">
                    <button
                      onClick={() => startEditing(task)}
                      disabled={task.completed}
                      className={`p-2 rounded-full transition-colors active:scale-90 active:brightness-95 ${task.completed ? 'text-text-disabled cursor-not-allowed' : 'text-primary hover:bg-primary hover:bg-opacity-10'}`}
                      aria-label="แก้ไข Task"
                    >
                      <Icon name="edit" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 text-error hover:bg-error hover:bg-opacity-10 rounded-full transition-colors active:scale-90 active:brightness-95"
                      aria-label="ลบ Task"
                    >
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TasksView;
