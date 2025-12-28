
import React, { useState, useEffect, useMemo } from 'react';
import { LayoutGrid, Users, BarChart3, Bell, Search, Plus, Zap } from 'lucide-react';
import TaskBoard from './components/TaskBoard';
import EmployeeManager from './components/EmployeeManager';
import Dashboard from './components/Dashboard';
import TaskCreator from './components/TaskCreator';
import EmployeeEditor from './components/EmployeeEditor';
import { Task, TaskStatus, Employee, AccessLevel } from './types';

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 1,
    fullName: 'Александр Волков',
    role: 'Lead Fullstack',
    email: 'volkov@company.com',
    phone: '+7 900 123-45-67',
    hireDate: '2021-01-15',
    isActive: true,
    accessLevel: AccessLevel.ADMIN,
    skills: ['Python', 'React', 'SQL'],
    loadPercentage: 65
  },
  {
    id: 2,
    fullName: 'Мария Кузнецова',
    role: 'Product Designer',
    email: 'kuznetsova@company.com',
    phone: '+7 900 987-65-43',
    hireDate: '2022-03-10',
    isActive: true,
    accessLevel: AccessLevel.MANAGER,
    skills: ['Figma', 'UI/UX'],
    loadPercentage: 42
  }
];

const INITIAL_TASKS: Task[] = [
  {
    id: 1042,
    title: 'Интеграция с API СБИС',
    description: 'Разработка модуля автоматического обмена данными и синхронизации статусов документов между системами.',
    status: TaskStatus.IN_PROGRESS,
    priority: 4,
    deadline: '24 Мая',
    creatorId: 1,
    assigneeId: 2,
    tags: ['Core', 'API'],
    weightHours: 12,
    createdAt: '15.05',
    updatedAt: '16.05'
  },
  {
    id: 1045,
    title: 'Верстка дашборда аналитики',
    description: 'Создание адаптивных графиков и виджетов для главного экрана CRM.',
    status: TaskStatus.NEW,
    priority: 3,
    deadline: '28 Мая',
    creatorId: 2,
    assigneeId: 1,
    tags: ['Frontend', 'UI'],
    weightHours: 8,
    createdAt: '18.05',
    updatedAt: '18.05'
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'employees' | 'dashboard'>('tasks');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const tg = useMemo(() => (window as any).Telegram?.WebApp, []);

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }

    const savedTasks = localStorage.getItem('crm_tasks_v2');
    const savedEmployees = localStorage.getItem('crm_employees_v2');

    setTasks(savedTasks ? JSON.parse(savedTasks) : INITIAL_TASKS);
    setEmployees(savedEmployees ? JSON.parse(savedEmployees) : INITIAL_EMPLOYEES);

    setTimeout(() => setLoading(false), 800);
  }, [tg]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('crm_tasks_v2', JSON.stringify(tasks));
      localStorage.setItem('crm_employees_v2', JSON.stringify(employees));
    }
  }, [tasks, employees, loading]);

  const handleTabChange = (tab: 'tasks' | 'employees' | 'dashboard') => {
    setActiveTab(tab);
    tg?.HapticFeedback?.selectionChanged();
  };

  const addTask = (newTaskData: Partial<Task>) => {
    const newTask: Task = {
      id: Math.floor(Math.random() * 9000) + 1000,
      title: newTaskData.title || 'Без названия',
      description: newTaskData.description || 'Описание отсутствует',
      status: TaskStatus.NEW,
      priority: newTaskData.priority || 3,
      deadline: newTaskData.deadline || 'Без срока',
      creatorId: 1,
      assigneeId: newTaskData.assigneeId || 1,
      tags: ['Новая'],
      weightHours: newTaskData.weightHours || 4,
      createdAt: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      updatedAt: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
    };

    setTasks([newTask, ...tasks]);
    tg?.HapticFeedback?.notificationOccurred('success');
  };

  const saveEmployee = (empData: Partial<Employee>) => {
    if (editingEmployee) {
      setEmployees(prev => prev.map(e => e.id === editingEmployee.id ? { ...e, ...empData } : e));
      tg?.HapticFeedback?.notificationOccurred('success');
    } else {
      const newEmp: Employee = {
        id: Date.now(),
        fullName: empData.fullName || 'Новый сотрудник',
        role: empData.role || 'Должность не указана',
        email: empData.email || '',
        phone: empData.phone || '',
        hireDate: new Date().toISOString().split('T')[0],
        isActive: true,
        accessLevel: empData.accessLevel || AccessLevel.EXECUTOR,
        skills: empData.skills || [],
        loadPercentage: 0
      };
      setEmployees(prev => [...prev, newEmp]);
      tg?.HapticFeedback?.notificationOccurred('success');
    }
    setIsEmployeeModalOpen(false);
    setEditingEmployee(null);
  };

  const openEmployeeEditor = (emp?: Employee) => {
    setEditingEmployee(emp || null);
    setIsEmployeeModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#f8fafc]">
      <header className="sticky top-0 z-30 px-6 pt-10 pb-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Zap size={22} fill="white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight leading-none text-slate-900">TaskPro</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">CRM Система</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
            <Search size={20} />
          </button>
          <div className="relative">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
              <Bell size={20} />
            </button>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar scroll-smooth">
        <div className="animate-fade-up py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Загрузка данных...</p>
            </div>
          ) : (
            <>
              {activeTab === 'tasks' && <TaskBoard tasks={tasks} />}
              {activeTab === 'employees' && (
                <EmployeeManager 
                  employees={employees} 
                  onEdit={openEmployeeEditor} 
                  onAdd={() => openEmployeeEditor()} 
                />
              )}
              {activeTab === 'dashboard' && <Dashboard tasks={tasks} employees={employees} />}
            </>
          )}
        </div>
      </main>

      {activeTab === 'tasks' && !isTaskModalOpen && (
        <button 
          onClick={() => setIsTaskModalOpen(true)}
          className="fixed bottom-28 right-6 w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/40 flex items-center justify-center transition-all hover:scale-110 active:scale-90 z-40 group"
        >
          <Plus size={32} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
        <nav className="bg-white/90 backdrop-blur-2xl rounded-[32px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2 flex justify-between items-center">
          <button 
            onClick={() => handleTabChange('tasks')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[24px] transition-all duration-300 ${
              activeTab === 'tasks' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid size={22} />
            <span className="text-[10px] font-bold">Задачи</span>
          </button>
          
          <button 
            onClick={() => handleTabChange('employees')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[24px] transition-all duration-300 ${
              activeTab === 'employees' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-50'
            }`}
          >
            <Users size={22} />
            <span className="text-[10px] font-bold">Команда</span>
          </button>
          
          <button 
            onClick={() => handleTabChange('dashboard')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[24px] transition-all duration-300 ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-50'
            }`}
          >
            <BarChart3 size={22} />
            <span className="text-[10px] font-bold">Анализ</span>
          </button>
        </nav>
      </div>

      {isTaskModalOpen && (
        <TaskCreator 
          onClose={() => setIsTaskModalOpen(false)} 
          onSave={addTask}
        />
      )}

      {isEmployeeModalOpen && (
        <EmployeeEditor
          employee={editingEmployee}
          onClose={() => {
            setIsEmployeeModalOpen(false);
            setEditingEmployee(null);
          }}
          onSave={saveEmployee}
        />
      )}
    </div>
  );
};

export default App;
