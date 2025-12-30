import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LayoutGrid, Users, BarChart3, Plus, Zap, CheckCircle2, Shield, User as UserIcon, ArrowRight, Link as LinkIcon, Globe, RefreshCw, AlertCircle } from 'lucide-react';
import TaskBoard from './components/TaskBoard';
import EmployeeManager from './components/EmployeeManager';
import Dashboard from './components/Dashboard';
import TaskCreator from './components/TaskCreator';
import EmployeeEditor from './components/EmployeeEditor';
import TaskDetails from './components/TaskDetails';
import { Task, TaskStatus, Employee, AccessLevel } from './types';

// Конфигурация API
const API_URL = (window as any).VITE_API_URL || 'http://localhost:8000/api/v1';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'employees' | 'dashboard'>('tasks');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [filterEmployeeId, setFilterEmployeeId] = useState<number | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const [isRegistered, setIsRegistered] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<'choice' | 'invite_input'>('choice');
  const [inviteLinkInput, setInviteLinkInput] = useState('');
  const [teamId, setTeamId] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState('');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const tg = useMemo(() => (window as any).Telegram?.WebApp, []);
  const currentTelegramUser = useMemo(() => tg?.initDataUnsafe?.user, [tg]);
  const currentUserId = useMemo(() => currentTelegramUser?.id || 77777, [currentTelegramUser]);

  const currentUserProfile = useMemo(() => 
    employees.find(e => e.telegramId === currentUserId || e.id === currentUserId), 
  [employees, currentUserId]);

  const syncData = useCallback(async (forcedTeamId?: string) => {
    const activeTeamId = forcedTeamId || teamId;
    if (!activeTeamId) return;

    setIsSyncing(true);
    try {
      const response = await fetch(`${API_URL}/sync/?team_id=${activeTeamId}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      
      const data = await response.json();
      setTasks(data.tasks || []);
      setEmployees(data.employees || []);
      setApiError(null);
    } catch (error) {
      console.error("Fetch error:", error);
      setApiError("Ошибка соединения. Проверьте статус сервера CRM.");
    } finally {
      setIsSyncing(false);
      setLoading(false);
    }
  }, [teamId]);

  const pushData = useCallback(async (updatedTasks: Task[], updatedEmps: Employee[]) => {
    if (!teamId) return;
    
    setTasks(updatedTasks);
    setEmployees(updatedEmps);

    try {
      const response = await fetch(`${API_URL}/sync/`, {
        method: 'POST',
        mode: 'cors',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          team_id: teamId,
          tasks: updatedTasks,
          employees: updatedEmps
        })
      });
      
      if (!response.ok) throw new Error(`Save failed: ${response.status}`);
      setApiError(null);
    } catch (error) {
      console.error("Push error:", error);
      setApiError("Ошибка сохранения. Данные хранятся локально.");
    }
  }, [teamId]);

  useEffect(() => {
    const savedTeamId = localStorage.getItem('matrix_current_team_id');
    const savedReg = localStorage.getItem('matrix_is_registered');
    
    if (savedTeamId) {
      setTeamId(savedTeamId);
      if (savedReg === 'true') {
        setIsRegistered(true);
        syncData(savedTeamId);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && isRegistered) syncData();
    }, 15000);
    return () => clearInterval(interval);
  }, [syncData, isRegistered]);

  const handleCreateTeam = () => {
    const newTeamId = `team_${currentUserId}_${Math.random().toString(36).substr(2, 4)}`;
    const admin: Employee = {
      id: currentUserId,
      telegramId: currentUserId,
      fullName: currentTelegramUser ? `${currentTelegramUser.first_name} ${currentTelegramUser.last_name || ''}`.trim() : 'Администратор',
      role: 'Руководитель',
      email: '',
      phone: '',
      hireDate: new Date().toISOString().split('T')[0],
      isActive: true,
      accessLevel: AccessLevel.ADMIN,
      skills: ['Основатель'],
      loadPercentage: 0
    };

    setTeamId(newTeamId);
    localStorage.setItem('matrix_current_team_id', newTeamId);
    localStorage.setItem('matrix_is_registered', 'true');
    setIsRegistered(true);
    pushData([], [admin]);
    tg?.HapticFeedback?.notificationOccurred('success');
  };

  const handleJoinTeam = async () => {
    try {
      const url = new URL(inviteLinkInput);
      const extractedTeamId = url.searchParams.get('teamId');
      
      if (!extractedTeamId) {
        setInviteError('Неверный ID команды в ссылке.');
        return;
      }

      setTeamId(extractedTeamId);
      localStorage.setItem('matrix_current_team_id', extractedTeamId);
      localStorage.setItem('matrix_is_registered', 'true');

      const response = await fetch(`${API_URL}/sync/?team_id=${extractedTeamId}`);
      if (!response.ok) throw new Error('Unreachable');
      
      const data = await response.json();
      
      const executor: Employee = {
        id: currentUserId,
        telegramId: currentUserId,
        fullName: currentTelegramUser ? `${currentTelegramUser.first_name} ${currentTelegramUser.last_name || ''}`.trim() : 'Исполнитель',
        role: 'Исполнитель',
        email: '',
        phone: '',
        hireDate: new Date().toISOString().split('T')[0],
        isActive: true,
        accessLevel: AccessLevel.EXECUTOR,
        skills: [],
        loadPercentage: 0
      };

      const updatedEmps = [...(data.employees || [])];
      if (!updatedEmps.find(e => e.id === currentUserId)) {
        updatedEmps.push(executor);
      }

      await pushData(data.tasks || [], updatedEmps);
      setIsRegistered(true);
      setShowWelcome(true);
      tg?.HapticFeedback?.notificationOccurred('success');
    } catch (e) {
      setInviteError('Не удалось подключиться к серверу этой команды.');
    }
  };

  const addTask = (data: Partial<Task>) => {
    const newDisplayId = tasks.length + 1;
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
      assigneeName: employees.find(e => e.id === data.assigneeId)?.fullName || 'Не назначен',
      tags: [],
      weightHours: 4,
      createdAt: new Date().toLocaleDateString('ru-RU'),
      updatedAt: new Date().toLocaleDateString('ru-RU'),
      comments: []
    };
    pushData([newTask, ...tasks], employees);
    tg?.HapticFeedback?.notificationOccurred('success');
  };

  const handleTabChange = (tab: 'tasks' | 'employees' | 'dashboard') => {
    setActiveTab(tab);
    if (tab === 'tasks') setFilterEmployeeId(null);
    tg?.HapticFeedback?.impactOccurred('light');
  };

  const visibleTasks = useMemo(() => {
    // Показываем все задачи, но фильтруем, если выбран конкретный сотрудник
    if (filterEmployeeId) return tasks.filter(t => t.assigneeId === filterEmployeeId);
    return tasks;
  }, [tasks, filterEmployeeId]);

  if (!isRegistered && !loading) {
    return (
      <div className="flex flex-col h-screen bg-white px-8 justify-center items-center text-center animate-fade-up">
        <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl mb-10 rotate-3">
          <Zap size={50} fill="white" />
        </div>
        {onboardingStep === 'choice' ? (
          <div className="space-y-6 w-full max-w-sm">
            <h1 className="text-3xl font-black text-slate-900 leading-tight">Добро пожаловать в Matrix</h1>
            <p className="text-slate-500 font-medium">Система управления задачами для эффективных команд.</p>
            <div className="space-y-3 pt-4">
              <button 
                onClick={handleCreateTeam}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} strokeWidth={3} /> Создать команду
              </button>
              <button 
                onClick={() => setOnboardingStep('invite_input')}
                className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl font-black hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <LinkIcon size={20} strokeWidth={3} /> Войти по ссылке
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 w-full max-w-sm animate-fade-in">
             <h1 className="text-2xl font-black text-slate-900">Вход по приглашению</h1>
             <div className="space-y-3">
               <input 
                 type="text" 
                 value={inviteLinkInput}
                 onChange={(e) => setInviteLinkInput(e.target.value)}
                 placeholder="Вставьте ссылку-приглашение"
                 className="w-full bg-slate-50 border-2 border-slate-100 px-5 py-4 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-800"
               />
               {inviteError && <p className="text-rose-500 text-xs font-black">{inviteError}</p>}
             </div>
             <div className="flex gap-3">
               <button onClick={() => setOnboardingStep('choice')} className="flex-1 py-4 text-slate-400 font-black">Назад</button>
               <button 
                 onClick={handleJoinTeam} 
                 disabled={!inviteLinkInput}
                 className={`flex-[2] py-4 rounded-2xl font-black text-white shadow-lg transition-all ${inviteLinkInput ? 'bg-indigo-600' : 'bg-slate-300'}`}
               >
                 Войти
               </button>
             </div>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin text-indigo-600"><RefreshCw size={32} /></div>
      </div>
    );
  }

  // Определяем права доступа: если профиль есть и роль Админ, ИЛИ если это единственный пользователь (создатель/демо)
  const isAdmin = currentUserProfile?.accessLevel === AccessLevel.ADMIN || employees.length <= 1;
  const canCreateTask = !!currentUserProfile; // Любой авторизованный пользователь может создавать задачи

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900 relative">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-50/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-200/50">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
             <Zap size={20} fill="white" />
           </div>
           <div>
             <h1 className="text-lg font-black leading-none">Matrix</h1>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentUserProfile?.role || 'Гость'}</p>
           </div>
        </div>
        <div className="flex items-center gap-2">
           {isSyncing && <RefreshCw size={14} className="text-slate-400 animate-spin" />}
           <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-black text-xs border-2 border-white shadow-sm">
             {currentUserProfile?.fullName[0] || '?'}
           </div>
        </div>
      </div>
      
      {apiError && (
        <div className="mx-6 mt-4 p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2 border border-rose-100">
           <AlertCircle size={14} /> {apiError}
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        {activeTab === 'tasks' && (
          <TaskBoard 
            tasks={visibleTasks} 
            onDelete={(id) => {
              const newTasks = tasks.filter(t => t.id !== id);
              pushData(newTasks, employees);
            }}
            onTaskClick={setSelectedTask}
            filterEmployeeName={filterEmployeeId ? employees.find(e => e.id === filterEmployeeId)?.fullName : undefined}
          />
        )}
        
        {activeTab === 'employees' && (
          <EmployeeManager 
            employees={employees}
            onEdit={(emp) => {
              setEditingEmployee(emp);
              setIsEmployeeModalOpen(true);
            }}
            onAdd={() => {
              setEditingEmployee(null);
              setIsEmployeeModalOpen(true);
            }}
            onDelete={(id) => {
              const newEmps = employees.filter(e => e.id !== id);
              pushData(tasks, newEmps);
            }}
            onViewTasks={(id) => {
               setFilterEmployeeId(id);
               setActiveTab('tasks');
            }}
            isAdmin={isAdmin}
            teamId={teamId || ''}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard tasks={tasks} employees={employees} />
        )}
      </div>

      {/* FAB - Кнопка создания задачи доступна всем участникам */}
      {activeTab === 'tasks' && canCreateTask && (
        <button 
          onClick={() => setIsTaskModalOpen(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 active:scale-90 transition-all z-30"
        >
          <Plus size={28} strokeWidth={3} />
        </button>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl p-2 rounded-[24px] shadow-2xl border border-slate-200/50 flex justify-between items-center z-40">
         <button onClick={() => handleTabChange('tasks')} className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all ${activeTab === 'tasks' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
           <LayoutGrid size={22} strokeWidth={activeTab === 'tasks' ? 3 : 2} />
           <span className="text-[9px] font-black uppercase tracking-wide">Задачи</span>
         </button>
         <button onClick={() => handleTabChange('employees')} className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all ${activeTab === 'employees' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
           <Users size={22} strokeWidth={activeTab === 'employees' ? 3 : 2} />
           <span className="text-[9px] font-black uppercase tracking-wide">Команда</span>
         </button>
         <button onClick={() => handleTabChange('dashboard')} className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
           <BarChart3 size={22} strokeWidth={activeTab === 'dashboard' ? 3 : 2} />
           <span className="text-[9px] font-black uppercase tracking-wide">Отчет</span>
         </button>
      </div>

      {/* Modals */}
      {isTaskModalOpen && (
        <TaskCreator 
          employees={employees} 
          onClose={() => setIsTaskModalOpen(false)}
          onSave={addTask}
        />
      )}

      {isEmployeeModalOpen && (
        <EmployeeEditor 
          employee={editingEmployee}
          teamId={teamId || ''}
          onClose={() => setIsEmployeeModalOpen(false)}
          onSave={(data) => {
             let newEmps = [...employees];
             if (editingEmployee) {
               newEmps = newEmps.map(e => e.id === editingEmployee.id ? { ...e, ...data } : e);
             } else {
               const newEmp: Employee = {
                 id: Date.now(),
                 fullName: data.fullName || 'Новый сотрудник',
                 role: data.role || 'Сотрудник',
                 email: data.email || '',
                 phone: data.phone || '',
                 hireDate: new Date().toISOString().split('T')[0],
                 isActive: true,
                 accessLevel: data.accessLevel || AccessLevel.EXECUTOR,
                 skills: [],
                 loadPercentage: 0,
                 ...data
               };
               newEmps.push(newEmp);
             }
             pushData(tasks, newEmps);
             setIsEmployeeModalOpen(false);
          }}
        />
      )}

      {selectedTask && (
        <TaskDetails 
          task={selectedTask}
          currentUser={currentUserProfile || employees[0]}
          onClose={() => setSelectedTask(null)}
          isAdmin={isAdmin}
          onDelete={(id) => {
             const newTasks = tasks.filter(t => t.id !== id);
             pushData(newTasks, employees);
             setSelectedTask(null);
          }}
          onUpdate={(updatedTask) => {
             const newTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
             pushData(newTasks, employees);
             setSelectedTask(updatedTask);
          }}
        />
      )}
    </div>
  );
};

export default App;