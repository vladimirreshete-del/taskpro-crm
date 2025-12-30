
import React, { useState, useEffect, useMemo } from 'react';
import { LayoutGrid, Users, BarChart3, Bell, Plus, Zap } from 'lucide-react';
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
  const [filterEmployeeId, setFilterEmployeeId] = useState<number | null>(null);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const tg = useMemo(() => (window as any).Telegram?.WebApp, []);
  const currentTelegramUser = useMemo(() => tg?.initDataUnsafe?.user, [tg]);
  const currentUserId = useMemo(() => currentTelegramUser?.id || 12345, [currentTelegramUser]);
  
  const storageKeyTasks = `matrix_tasks_v4_${currentUserId}`;
  const storageKeyEmps = `matrix_emps_v4_${currentUserId}`;
  const storageKeyCounter = `matrix_counter_v4_${currentUserId}`;

  const currentUserProfile = useMemo(() => 
    employees.find(e => e.telegramId === currentUserId || e.id === currentUserId), 
  [employees, currentUserId]);

  // Logic to register user when joining via invitation link
  useEffect(() => {
    if (loading) return;

    const params = new URLSearchParams(window.location.search);
    const isInvite = params.get('invite') === 'executor';

    if (isInvite && currentTelegramUser) {
      const alreadyExists = employees.find(e => e.telegramId === currentUserId);
      
      if (!alreadyExists) {
        const newExecutor: Employee = {
          id: currentUserId,
          telegramId: currentUserId,
          fullName: `${currentTelegramUser.first_name} ${currentTelegramUser.last_name || ''}`.trim(),
          role: 'Исполнитель',
          email: '',
          phone: '',
          hireDate: new Date().toISOString().split('T')[0],
          isActive: true,
          accessLevel: AccessLevel.EXECUTOR,
          skills: [],
          loadPercentage: 0
        };
        
        const updatedEmps = [...employees, newExecutor];
        setEmployees(updatedEmps);
        localStorage.setItem(storageKeyEmps, JSON.stringify(updatedEmps));
        
        // Remove invite from URL to prevent infinite loop or re-adding
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({ path: newUrl }, '', newUrl);
        
        tg?.HapticFeedback?.notificationOccurred('success');
        alert("Добро пожаловать в команду 1C Matrix!");
      }
    }
  }, [loading, currentTelegramUser, employees, currentUserId, storageKeyEmps, tg]);

  const visibleTasks = useMemo(() => {
    let filtered = tasks;
    if (currentUserProfile?.accessLevel === AccessLevel.EXECUTOR) {
      filtered = tasks.filter(t => t.assigneeId === currentUserProfile.id || t.assigneeId === currentUserId);
    } else if (filterEmployeeId) {
      filtered = tasks.filter(t => t.assigneeId === filterEmployeeId);
    }
    return filtered;
  }, [tasks, currentUserProfile, currentUserId, filterEmployeeId]);

  const fetchData = () => {
    const savedEmps = localStorage.getItem(storageKeyEmps);
    let emps: Employee[] = savedEmps ? JSON.parse(savedEmps) : [];

    // First login logic: Admin creation if not joined via invite
    if (currentTelegramUser && !emps.find(e => e.telegramId === currentUserId)) {
      const params = new URLSearchParams(window.location.search);
      const isInvite = params.get('invite') === 'executor';

      // If NOT an invite, the very first user is usually an Admin
      if (!isInvite) {
        const self: Employee = {
          id: currentUserId,
          telegramId: currentUserId,
          fullName: `${currentTelegramUser.first_name} ${currentTelegramUser.last_name || ''}`.trim(),
          role: 'Администратор',
          email: '',
          phone: '',
          hireDate: new Date().toISOString().split('T')[0],
          isActive: true,
          accessLevel: AccessLevel.ADMIN,
          skills: ['Владелец'],
          loadPercentage: 0
        };
        emps = [self, ...emps];
        localStorage.setItem(storageKeyEmps, JSON.stringify(emps));
      }
    }
    
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
  }, [tasks, employees, loading]);

  const handleTabChange = (tab: 'tasks' | 'employees' | 'dashboard') => {
    setActiveTab(tab);
    setFilterEmployeeId(null);
    tg?.HapticFeedback?.selectionChanged();
  };

  const addTask = (data: Partial<Task>) => {
    const currentCounter = parseInt(localStorage.getItem(storageKeyCounter) || '0');
    const newDisplayId = currentCounter + 1;
    localStorage.setItem(storageKeyCounter, newDisplayId.toString());

    const assignee = employees.find(e => e.id === data.assigneeId);

    const newTask: Task = {
      id: Date.now(),
      displayId: newDisplayId,
      title: data.title || 'Новая задача',
      organizationName: data.organizationName || 'Не указана',
      solutionContext: data.solutionContext || '',
      description: data.description || '',
      status: TaskStatus.NEW,
      priority: (data.priority as any) || 'Обычная',
      deadline: data.deadline || 'Без срока',
      creatorId: currentUserId,
      assigneeId: data.assigneeId || currentUserId,
      assigneeName: assignee ? assignee.fullName : 'Не назначен',
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
    if (confirm('Удалить задачу?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
      setSelectedTask(null);
      tg?.HapticFeedback?.notificationOccurred('warning');
    }
  };

  const deleteEmployee = (id: number) => {
    if (id === currentUserId) {
      alert("Нельзя удалить себя");
      return;
    }
    if (confirm('Удалить сотрудника?')) {
      setEmployees(prev => prev.filter(e => e.id !== id));
      tg?.HapticFeedback?.notificationOccurred('warning');
    }
  };

  const saveEmployee = (empData: Partial<Employee>) => {
    if (editingEmployee) {
      setEmployees(prev => prev.map(e => e.id === editingEmployee.id ? { ...e, ...empData } as Employee : e));
    } else {
      setEmployees(prev => [...prev, { ...empData, id: Date.now(), isActive: true, loadPercentage: 0, accessLevel: empData.accessLevel || AccessLevel.EXECUTOR } as Employee]);
    }
    setIsEmployeeModalOpen(false);
    tg?.HapticFeedback?.notificationOccurred('success');
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#f8fafc]">
      <header className="sticky top-0 z-30 px-6 pt-10 pb-4 flex items-center justify-between bg-white border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Zap size={22} fill="white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight leading-none text-slate-900">1C Matrix</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">
              {currentUserProfile?.fullName || 'Гость'} • {currentUserProfile?.accessLevel || 'Исполнитель'}
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
                  filterEmployeeName={employees.find(e => e.id === filterEmployeeId)?.fullName}
                />
              )}
              {activeTab === 'employees' && (
                <EmployeeManager 
                  employees={employees} 
                  onEdit={(emp) => { setEditingEmployee(emp); setIsEmployeeModalOpen(true); }} 
                  onAdd={() => { setEditingEmployee(null); setIsEmployeeModalOpen(true); }} 
                  onDelete={deleteEmployee}
                  onViewTasks={(id) => { setFilterEmployeeId(id); setActiveTab('tasks'); }}
                  isAdmin={currentUserProfile?.accessLevel === AccessLevel.ADMIN}
                />
              )}
              {activeTab === 'dashboard' && <Dashboard tasks={tasks} employees={employees} />}
            </>
          )}
        </div>
      </main>

      {activeTab === 'tasks' && currentUserProfile?.accessLevel === AccessLevel.ADMIN && !isTaskModalOpen && (
        <button onClick={() => setIsTaskModalOpen(true)} className="fixed bottom-28 right-6 w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-xl flex items-center justify-center z-40 active:scale-95 transition-transform"><Plus size={32} /></button>
      )}

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
        <nav className="bg-white/95 backdrop-blur-2xl rounded-[32px] border border-slate-200 shadow-xl p-2 flex justify-between items-center">
          <button onClick={() => handleTabChange('tasks')} className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[24px] ${activeTab === 'tasks' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
            <LayoutGrid size={22} /><span className="text-[10px] font-bold">Задачи</span>
          </button>
          <button onClick={() => handleTabChange('employees')} className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[24px] ${activeTab === 'employees' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
            <Users size={22} /><span className="text-[10px] font-bold">Команда</span>
          </button>
          <button onClick={() => handleTabChange('dashboard')} className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[24px] ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
            <BarChart3 size={22} /><span className="text-[10px] font-bold">Анализ</span>
          </button>
        </nav>
      </div>

      {isTaskModalOpen && <TaskCreator employees={employees} onClose={() => setIsTaskModalOpen(false)} onSave={addTask} />}
      {isEmployeeModalOpen && <EmployeeEditor employee={editingEmployee} onClose={() => { setIsEmployeeModalOpen(false); setEditingEmployee(null); }} onSave={saveEmployee} />}
      {selectedTask && <TaskDetails task={selectedTask} currentUser={currentUserProfile || ({} as any)} onClose={() => setSelectedTask(null)} onUpdate={updateTask} onDelete={deleteTask} isAdmin={currentUserProfile?.accessLevel === AccessLevel.ADMIN} />}
    </div>
  );
};

export default App;
