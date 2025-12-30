
import React, { useState, useEffect, useMemo } from 'react';
import { LayoutGrid, Users, BarChart3, Plus, Zap, CheckCircle2, Shield, User as UserIcon, ArrowRight, Link as LinkIcon } from 'lucide-react';
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
  const [showWelcome, setShowWelcome] = useState(false);
  
  // Onboarding states
  const [view, setView] = useState<'onboarding' | 'main'>('onboarding');
  const [onboardingStep, setOnboardingStep] = useState<'choice' | 'invite_input'>('choice');
  const [inviteLinkInput, setInviteLinkInput] = useState('');
  const [inviteError, setInviteError] = useState('');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const tg = useMemo(() => (window as any).Telegram?.WebApp, []);
  const currentTelegramUser = useMemo(() => tg?.initDataUnsafe?.user, [tg]);
  const currentUserId = useMemo(() => currentTelegramUser?.id || 9999, [currentTelegramUser]);
  
  const storageKeyTasks = `matrix_shared_tasks_v6`;
  const storageKeyEmps = `matrix_shared_emps_v6`;
  const storageKeyCounter = `matrix_shared_counter_v6`;

  const currentUserProfile = useMemo(() => 
    employees.find(e => e.telegramId === currentUserId || e.id === currentUserId), 
  [employees, currentUserId]);

  const fetchData = () => {
    const savedEmps = localStorage.getItem(storageKeyEmps);
    let emps: Employee[] = savedEmps ? JSON.parse(savedEmps) : [];

    const existingProfile = emps.find(e => e.telegramId === currentUserId || e.id === currentUserId);

    if (existingProfile) {
      setView('main');
    } else {
      // Check if arriving with a direct link
      const params = new URLSearchParams(window.location.search);
      if (params.get('invite') === 'executor') {
        setOnboardingStep('invite_input');
        setInviteLinkInput(window.location.href);
      }
      setView('onboarding');
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
    }
    fetchData();
  }, [tg, currentUserId]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(storageKeyTasks, JSON.stringify(tasks));
      localStorage.setItem(storageKeyEmps, JSON.stringify(employees));
    }
  }, [tasks, employees, loading]);

  const handleRegister = (role: AccessLevel) => {
    const newUser: Employee = {
      id: currentUserId,
      telegramId: currentUserId,
      fullName: currentTelegramUser ? `${currentTelegramUser.first_name} ${currentTelegramUser.last_name || ''}`.trim() : (role === AccessLevel.ADMIN ? 'Администратор' : 'Новый сотрудник'),
      role: role === AccessLevel.ADMIN ? 'Руководитель' : 'Исполнитель',
      email: '',
      phone: '',
      hireDate: new Date().toISOString().split('T')[0],
      isActive: true,
      accessLevel: role,
      skills: role === AccessLevel.ADMIN ? ['Владелец'] : [],
      loadPercentage: 0
    };

    const updatedEmps = [...employees, newUser];
    setEmployees(updatedEmps);
    localStorage.setItem(storageKeyEmps, JSON.stringify(updatedEmps));
    setView('main');
    if (role === AccessLevel.EXECUTOR) setShowWelcome(true);
    tg?.HapticFeedback?.notificationOccurred('success');
  };

  const handleJoinByInvite = () => {
    try {
      const url = new URL(inviteLinkInput);
      if (url.searchParams.get('invite') === 'executor') {
        handleRegister(AccessLevel.EXECUTOR);
      } else {
        setInviteError('Некорректная ссылка. Убедитесь, что она содержит пригласительный код.');
      }
    } catch (e) {
      setInviteError('Пожалуйста, введите валидную ссылку.');
    }
  };

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

  const visibleTasks = useMemo(() => {
    let filtered = tasks;
    if (currentUserProfile?.accessLevel === AccessLevel.EXECUTOR) {
      filtered = tasks.filter(t => t.assigneeId === currentUserProfile.id || t.assigneeId === currentUserId);
    } else if (filterEmployeeId) {
      filtered = tasks.filter(t => t.assigneeId === filterEmployeeId);
    }
    return filtered;
  }, [tasks, currentUserProfile, currentUserId, filterEmployeeId]);

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

  if (view === 'onboarding') {
    return (
      <div className="flex flex-col h-screen bg-slate-50 px-8 justify-center items-center text-center animate-fade-up">
        <div className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 mb-8">
          <Zap size={44} fill="white" />
        </div>
        
        {onboardingStep === 'choice' ? (
          <div className="space-y-8 w-full max-w-sm">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Добро пожаловать</h1>
              <p className="text-slate-400 font-bold text-sm">Выберите вашу роль в системе 1C Matrix</p>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={() => handleRegister(AccessLevel.ADMIN)}
                className="w-full bg-white p-6 rounded-[32px] border-2 border-transparent hover:border-indigo-500 transition-all flex items-center gap-5 group shadow-sm text-left active:scale-[0.98]"
              >
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Shield size={28} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800">Я Администратор</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Создать новую команду</p>
                </div>
                <ArrowRight size={20} className="ml-auto text-slate-200 group-hover:text-indigo-600 transition-all" />
              </button>

              <button 
                onClick={() => setOnboardingStep('invite_input')}
                className="w-full bg-white p-6 rounded-[32px] border-2 border-transparent hover:border-indigo-500 transition-all flex items-center gap-5 group shadow-sm text-left active:scale-[0.98]"
              >
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <UserIcon size={28} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800">Я Исполнитель</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Присоединиться по ссылке</p>
                </div>
                <ArrowRight size={20} className="ml-auto text-slate-200 group-hover:text-amber-500 transition-all" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 w-full max-w-sm">
            <button onClick={() => setOnboardingStep('choice')} className="text-slate-400 font-bold text-xs hover:text-indigo-600 transition-colors uppercase tracking-widest">← Назад к выбору</button>
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Пригласительная ссылка</h2>
              <p className="text-slate-400 font-bold text-sm">Вставьте ссылку, которую вам отправил руководитель</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"><LinkIcon size={18} /></div>
                <input 
                  type="text" 
                  value={inviteLinkInput}
                  onChange={(e) => { setInviteLinkInput(e.target.value); setInviteError(''); }}
                  placeholder="https://matrix.app/?invite=..."
                  className="w-full bg-white border-2 border-transparent focus:border-indigo-500/30 px-12 py-5 rounded-[24px] outline-none font-bold text-sm shadow-sm transition-all"
                />
              </div>
              {inviteError && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider">{inviteError}</p>}
              <button 
                onClick={handleJoinByInvite}
                disabled={!inviteLinkInput}
                className={`w-full py-5 rounded-[24px] font-black text-sm shadow-xl transition-all active:scale-95 ${inviteLinkInput ? 'bg-indigo-600 text-white shadow-indigo-500/30' : 'bg-slate-200 text-slate-400'}`}
              >
                Присоединиться
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#f8fafc]">
      {showWelcome && (
        <div className="fixed top-24 left-6 right-6 z-[200] bg-emerald-600 text-white p-4 rounded-2xl shadow-2xl animate-fade-up flex items-center gap-3 border border-emerald-500">
          <CheckCircle2 size={24} />
          <div>
            <p className="font-black text-sm">Вы в команде!</p>
            <p className="text-[10px] font-bold opacity-90 text-white/80">Ваш статус: Исполнитель (доступ ограничен)</p>
          </div>
          <button onClick={() => setShowWelcome(false)} className="ml-auto opacity-70 hover:opacity-100"><Plus className="rotate-45" size={20} /></button>
        </div>
      )}

      <header className="sticky top-0 z-30 px-6 pt-10 pb-4 flex items-center justify-between bg-white border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Zap size={22} fill="white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight leading-none text-slate-900">1C Matrix</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">
              {currentUserProfile?.fullName || 'Гость'} • <span className={currentUserProfile?.accessLevel === AccessLevel.ADMIN ? 'text-indigo-600' : 'text-amber-500'}>
                {currentUserProfile?.accessLevel || 'Инициализация...'}
              </span>
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
          {currentUserProfile?.accessLevel === AccessLevel.ADMIN && (
            <button onClick={() => handleTabChange('dashboard')} className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[24px] ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
              <BarChart3 size={22} /><span className="text-[10px] font-bold">Анализ</span>
            </button>
          )}
        </nav>
      </div>

      {isTaskModalOpen && <TaskCreator employees={employees} onClose={() => setIsTaskModalOpen(false)} onSave={addTask} />}
      {isEmployeeModalOpen && <EmployeeEditor employee={editingEmployee} onClose={() => { setIsEmployeeModalOpen(false); setEditingEmployee(null); }} onSave={saveEmployee} />}
      {selectedTask && (
        <TaskDetails 
          task={selectedTask} 
          currentUser={currentUserProfile || ({} as any)} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={updateTask} 
          onDelete={deleteTask} 
          isAdmin={currentUserProfile?.accessLevel === AccessLevel.ADMIN} 
        />
      )}
    </div>
  );
};

export default App;
