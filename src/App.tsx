
import React, { useState, useEffect, useMemo } from 'react';
import { LayoutGrid, Users, BarChart3, Bell, Search, Plus, Zap } from 'lucide-react';
import TaskBoard from './components/TaskBoard';
import EmployeeManager from './components/EmployeeManager';
import Dashboard from './components/Dashboard';
import TaskCreator from './components/TaskCreator';
import { Task, TaskStatus } from './types';

const API_URL = 'http://127.0.0.1:8000/api/v1';

const INITIAL_TASKS: Task[] = [
  {
    id: 1042,
    title: 'Интеграция с API СБИС',
    description: 'Разработка модуля автоматического обмена данными и синхронизации статусов документов.',
    status: TaskStatus.IN_PROGRESS,
    priority: 4,
    deadline: '24 Мая',
    creatorId: 1,
    assigneeId: 2,
    tags: ['Core', 'API'],
    weightHours: 12,
    createdAt: '15.05',
    updatedAt: '16.05'
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'employees' | 'dashboard'>('tasks');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const tg = useMemo(() => (window as any).Telegram?.WebApp, []);

  // Загрузка данных
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks/`);
      if (response.ok) {
        const data = await response.json();
        // Приведение типов Django к типам TS
        const mappedTasks = data.map((t: any) => ({
          ...t,
          deadline: t.deadline || 'Без срока',
          assigneeId: t.assignee
        }));
        setTasks(mappedTasks);
      } else {
        throw new Error('API Offline');
      }
    } catch (err) {
      console.log('Using LocalStorage Fallback');
      const saved = localStorage.getItem('crm_tasks');
      setTasks(saved ? JSON.parse(saved) : INITIAL_TASKS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
    fetchTasks();
  }, [tg]);

  useEffect(() => {
    localStorage.setItem('crm_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleTabChange = (tab: 'tasks' | 'employees' | 'dashboard') => {
    setActiveTab(tab);
    tg?.HapticFeedback?.selectionChanged();
  };

  const addTask = async (newTask: Partial<Task>) => {
    const tempId = Math.floor(Math.random() * 9000) + 1000;
    const taskData = {
      title: newTask.title || 'Без названия',
      description: newTask.description || '',
      status: TaskStatus.NEW,
      priority: newTask.priority || 3,
      deadline: newTask.deadline || 'Скоро',
      weight_hours: newTask.weightHours || 0,
    };

    try {
      const response = await fetch(`${API_URL}/tasks/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (response.ok) {
        fetchTasks();
      } else {
        throw new Error('Save failed');
      }
    } catch (err) {
      // Fallback
      const fallbackTask: Task = {
        id: tempId,
        ...taskData as any,
        createdAt: 'Сегодня',
        updatedAt: 'Сегодня'
      };
      setTasks([fallbackTask, ...tasks]);
    }
    
    tg?.HapticFeedback?.notificationOccurred('success');
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      <header className="sticky top-0 z-30 px-6 pt-10 pb-4 flex items-center justify-between bg-[#f8fafc]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Zap size={22} fill="white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight leading-none">TaskPro</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">CRM Management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 text-slate-500">
            <Search size={20} />
          </button>
          <div className="relative">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 text-slate-500">
              <Bell size={20} />
            </button>
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
        <div className="animate-fade-up">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {activeTab === 'tasks' && <TaskBoard tasks={tasks} />}
              {activeTab === 'employees' && <EmployeeManager />}
              {activeTab === 'dashboard' && <Dashboard />}
            </>
          )}
        </div>
      </main>

      {activeTab === 'tasks' && !isTaskModalOpen && (
        <button 
          onClick={() => setIsTaskModalOpen(true)}
          className="fixed bottom-28 right-6 w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/40 flex items-center justify-center transition-all hover:scale-105 active:scale-90 z-40"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      )}

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
        <nav className="glass bg-white/80 rounded-[28px] border border-white/40 shadow-2xl p-2 flex justify-between items-center">
          <button 
            onClick={() => handleTabChange('tasks')}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-[22px] transition-all duration-300 ${
              activeTab === 'tasks' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-indigo-500'
            }`}
          >
            <LayoutGrid size={22} />
            <span className="text-[10px] font-bold">Задачи</span>
          </button>
          
          <button 
            onClick={() => handleTabChange('employees')}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-[22px] transition-all duration-300 ${
              activeTab === 'employees' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-indigo-500'
            }`}
          >
            <Users size={22} />
            <span className="text-[10px] font-bold">Команда</span>
          </button>
          
          <button 
            onClick={() => handleTabChange('dashboard')}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-[22px] transition-all duration-300 ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-indigo-500'
            }`}
          >
            <BarChart3 size={22} />
            <span className="text-[10px] font-bold">Дашборд</span>
          </button>
        </nav>
      </div>

      {isTaskModalOpen && (
        <TaskCreator 
          onClose={() => setIsTaskModalOpen(false)} 
          onSave={addTask}
        />
      )}
    </div>
  );
};

export default App;
