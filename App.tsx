
import React, { useState, useEffect, useMemo } from 'react';
import { LayoutGrid, Users, BarChart3, Bell, Search, Plus, Zap } from 'lucide-react';
import TaskBoard from './components/TaskBoard';
import EmployeeManager from './components/EmployeeManager';
import Dashboard from './components/Dashboard';
import TaskCreator from './components/TaskCreator';
import EmployeeEditor from './components/EmployeeEditor';
import TaskDetails from './components/TaskDetails';
import { Task, TaskStatus, Employee, AccessLevel } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'employees' | 'dashboard'>('tasks');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const tg = useMemo(() => (window as any).Telegram?.WebApp, []);
  // Используем Telegram User ID для изоляции данных. Если зашли не через TG, используем 'local_admin'
  const currentTelegramUser = useMemo(() => tg?.initDataUnsafe?.user, [tg]);
  const currentUserId = useMemo(() => currentTelegramUser?.id || 999999, [currentTelegramUser]);
  
  const storageKeyTasks = `taskpro_tasks_${currentUserId}`;
  const storageKeyEmps = `taskpro_emps_${currentUserId}`;

  const currentUserProfile = useMemo(() => 
    employees.find(e => e.telegramId === currentUserId), 
  [employees, currentUserId]);

  // Фильтрация видимости: исполнитель видит только СВОИ задачи, админ — все.
  const visibleTasks = useMemo(() => {
    if (!currentUserProfile || currentUserProfile.accessLevel === AccessLevel.ADMIN) {
      return tasks;
    }
    return tasks.filter(t => t.assigneeId === currentUserProfile.id);
  }, [tasks, currentUserProfile]);

  const fetchData = () => {
    const savedEmps = localStorage.getItem(storageKeyEmps);
    let emps: Employee[] = savedEmps ? JSON.parse(savedEmps) : [];

    // Авто-создание профиля при первом входе
    if (currentTelegramUser && !emps.find(e => e.telegramId === currentUserId)) {
      const self: Employee = {
        id: currentUserId,
        telegramId: currentUserId,
        fullName: `${currentTelegramUser.first_name} ${currentTelegramUser.last_name || ''}`.trim(),
        role: 'Администратор системы',
        email: '',
        phone: '',
        hireDate: new Date().toISOString().split('T')[0],
        isActive: true,
        accessLevel: AccessLevel.ADMIN,
        skills: ['Owner'],
        loadPercentage: 0
      };
      emps = [self, ...emps];
      localStorage.setItem(storageKeyEmps, JSON.stringify(emps));
    }
    
    // Если список сотрудников пуст и мы не в Telegram (для тестов)
    if (emps.length === 0) {
      const demoAdmin: Employee = {
        id: 1,
        fullName: 'Администратор (Демо)',
        role: 'Админ',
        email: '',
        phone: '',
        hireDate: '2024-01-01',
        isActive: true,
        accessLevel: AccessLevel.ADMIN,
        skills: [],
        loadPercentage: 0
      };
      emps = [demoAdmin];
    }

    setEmployees(emps);
    const savedTasks = localStorage.getItem(storageKeyTasks);
    setTasks(savedTasks ? JSON.parse(savedTasks) : []);
    setLoading(false);
  };

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      tg.setHeaderColor?.('#ffffff');
    }
    fetchData();
  }, [tg, currentUserId]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(storageKeyTasks, JSON.stringify(tasks));
      localStorage.setItem(storageKeyEmps, JSON.stringify(employees));
    }
  }, [tasks, employees, loading, currentUserId]);

  const handleTabChange = (tab: 'tasks' | 'employees' | 'dashboard') => {
    setActiveTab(tab);
    tg?.HapticFeedback?.selectionChanged();
  };

  const addTask = (data: Partial<Task>) => {
    const newTask: Task = {
      id: Math.floor(Math.random() * 90000) + 10000,
      title: data.title || 'Новая задача',
      organizationName: data.organizationName || 'Не указана',
      solutionContext: data.solutionContext || '',
      description: data.description || '',
      status: TaskStatus.NEW,
      priority: data.priority || 3,
      deadline: data.deadline || 'Без срока',
      creatorId: currentUserId,
      assigneeId: data.assigneeId || currentUserId,
      tags: [],
      weightHours: 4,
      createdAt: new Date().toLocaleDateString('ru-RU'),
      updatedAt: new Date().toLocaleDateString('ru-RU'),
      comments: []
    };
    setTasks([newTask, ...tasks]);
    tg?.HapticFeedback?.notificationOccurred('success');
  };

  const updateTask = (updated: Task) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    if (selectedTask?.id === updated.id) setSelectedTask(updated);
  };

  const deleteTask = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить задачу?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
      setSelectedTask(null);
      tg?.HapticFeedback?.notificationOccurred('warning');
    }
  };

  const saveEmployee = (empData: Partial<Employee>) => {
    if (editingEmployee) {
      setEmployees(prev => prev.map(e => e.id === editingEmployee.id ? { ...e, ...empData } as Employee : e));
    } else {
      setEmployees(prev => [...prev, { ...empData, id: Date.now(), isActive: true, loadPercentage: 0 } as Employee]);
    }
    setIsEmployeeModalOpen(false);
    tg?.HapticFeedback?.notificationOccurred('success');
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
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">
              {currentUserProfile?.fullName || 'Гость'} • {currentUserProfile?.accessLevel || 'Пользователь'}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar scroll-smooth">
        <div className="animate-fade-up py-4">
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <>
              {activeTab === 'tasks' && (
                <TaskBoard 
                  tasks={visibleTasks} 
                  onDelete={deleteTask} 
                  onTaskClick={setSelectedTask} 
                />
              )}
              {activeTab === 'employees' && (
                <EmployeeManager 
                  employees={employees} 
                  onEdit={(emp) => { setEditingEmployee(emp); setIsEmployeeModalOpen(true); }} 
                  onAdd={() => { setEditingEmployee(null); setIsEmployeeModalOpen(true); }} 
                />
              )}
              {activeTab === 'dashboard' && <Dashboard tasks={tasks} employees={employees} />}
            </>
          )}
        </div>
      </main>

      {activeTab === 'tasks' && !isTaskModalOpen && (
        <button onClick={() => setIsTaskModalOpen(true)} className="fixed bottom-28 right-6 w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-xl flex items-center justify-center z-40 transition-transform active:scale-90"><Plus size={32} /></button>
      )}

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
        <nav className="bg-white/90 backdrop-blur-2xl rounded-[32px] border border-white/40 shadow-xl p-2 flex justify-between items-center">
          <button onClick={() => handleTabChange('tasks')} className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[24px] transition-all ${activeTab === 'tasks' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
            <LayoutGrid size={22} /><span className="text-[10px] font-bold">Задачи</span>
          </button>
          <button onClick={() => handleTabChange('employees')} className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[24px] transition-all ${activeTab === 'employees' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
            <Users size={22} /><span className="text-[10px] font-bold">Команда</span>
          </button>
          <button onClick={() => handleTabChange('dashboard')} className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[24px] transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
            <BarChart3 size={22} /><span className="text-[10px] font-bold">Анализ</span>
          </button>
        </nav>
      </div>

      {isTaskModalOpen && (
        <TaskCreator 
          employees={employees}
          onClose={() => setIsTaskModalOpen(false)} 
          onSave={addTask} 
        />
      )}
      
      {selectedTask && (
        <TaskDetails 
          task={selectedTask} 
          currentUser={currentUserProfile || { fullName: 'Аноним' } as any}
          onClose={() => setSelectedTask(null)} 
          onUpdate={updateTask}
          onDelete={deleteTask}
        />
      )}

      {isEmployeeModalOpen && (
        <EmployeeEditor 
          employee={editingEmployee} 
          onClose={() => setIsEmployeeModalOpen(false)} 
          onSave={saveEmployee} 
        />
      )}
    </div>
  );
};

export default App;
