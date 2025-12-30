
import React, { useState, useEffect, useMemo } from 'react';
import { LayoutGrid, Users, BarChart3, Plus, Zap, CheckCircle2, Shield, User as UserIcon, ArrowRight, Link as LinkIcon, Globe } from 'lucide-react';
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
  
  // States for Onboarding & Sync
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
  const currentUserId = useMemo(() => currentTelegramUser?.id || 777, [currentTelegramUser]);
  
  // Ключи теперь зависят от teamId для имитации синхронизации разных команд
  const getStorageKey = (type: 'tasks' | 'emps' | 'counter') => `matrix_team_${teamId || 'global'}_${type}`;

  const currentUserProfile = useMemo(() => 
    employees.find(e => e.telegramId === currentUserId || e.id === currentUserId), 
  [employees, currentUserId]);

  useEffect(() => {
    const savedTeamId = localStorage.getItem('matrix_current_team_id');
    const savedReg = localStorage.getItem('matrix_is_registered');
    
    if (savedTeamId) setTeamId(savedTeamId);
    if (savedReg === 'true') setIsRegistered(true);

    // Авто-детект ссылки при открытии
    const params = new URLSearchParams(window.location.search);
    if (params.get('invite') === 'executor' && params.get('teamId')) {
      setInviteLinkInput(window.location.href);
      setOnboardingStep('invite_input');
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (teamId) {
      const savedEmps = localStorage.getItem(getStorageKey('emps'));
      const savedTasks = localStorage.getItem(getStorageKey('tasks'));
      if (savedEmps) setEmployees(JSON.parse(savedEmps));
      if (savedTasks) setTasks(JSON.parse(savedTasks));
    }
  }, [teamId]);

  useEffect(() => {
    if (isRegistered && teamId) {
      localStorage.setItem(getStorageKey('tasks'), JSON.stringify(tasks));
      localStorage.setItem(getStorageKey('emps'), JSON.stringify(employees));
    }
  }, [tasks, employees, isRegistered, teamId]);

  const handleCreateTeam = () => {
    const newTeamId = `team_${currentUserId}_${Math.random().toString(36).substr(2, 5)}`;
    setTeamId(newTeamId);
    localStorage.setItem('matrix_current_team_id', newTeamId);
    
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

    setEmployees([admin]);
    setIsRegistered(true);
    localStorage.setItem('matrix_is_registered', 'true');
    tg?.HapticFeedback?.notificationOccurred('success');
  };

  const handleJoinTeam = () => {
    try {
      const url = new URL(inviteLinkInput);
      const extractedTeamId = url.searchParams.get('teamId');
      
      if (!extractedTeamId) {
        setInviteError('Неверная ссылка. Отсутствует ID команды.');
        return;
      }

      setTeamId(extractedTeamId);
      localStorage.setItem('matrix_current_team_id', extractedTeamId);
      
      const executor: Employee = {
        id: currentUserId,
        telegramId: currentUserId,
        fullName: currentTelegramUser ? `${currentTelegramUser.first_name} ${currentTelegramUser.last_name || ''}`.trim() : 'Новый сотрудник',
        role: 'Исполнитель',
        email: '',
        phone: '',
        hireDate: new Date().toISOString().split('T')[0],
        isActive: true,
        accessLevel: AccessLevel.EXECUTOR,
        skills: [],
        loadPercentage: 0
      };

      // В реальном приложении здесь был бы запрос: GET /api/team/{id}
      // Сейчас мы просто добавляем себя в локальный список (имитируем общую базу)
      const savedEmps = localStorage.getItem(`matrix_team_${extractedTeamId}_emps`);
      let teamEmps: Employee[] = savedEmps ? JSON.parse(savedEmps) : [];
      
      if (!teamEmps.find(e => e.id === currentUserId)) {
        teamEmps.push(executor);
      }
      
      setEmployees(teamEmps);
      setIsRegistered(true);
      setShowWelcome(true);
      localStorage.setItem('matrix_is_registered', 'true');
      tg?.HapticFeedback?.notificationOccurred('success');
    } catch (e) {
      setInviteError('Введите корректную ссылку.');
    }
  };

  const handleTabChange = (tab: 'tasks' | 'employees' | 'dashboard') => {
    setActiveTab(tab);
    setFilterEmployeeId(null);
    tg?.HapticFeedback?.selectionChanged();
  };

  const addTask = (data: Partial<Task>) => {
    const counterKey = getStorageKey('counter');
    const currentCounter = parseInt(localStorage.getItem(counterKey) || '0');
    const newDisplayId = currentCounter + 1;
    localStorage.setItem(counterKey, newDisplayId.toString());

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
    if (currentUserProfile?.accessLevel === AccessLevel.EXECUTOR) {
      return tasks.filter(t => t.assigneeId === currentUserId || t.assigneeId === currentUserProfile.id);
    }
    if (filterEmployeeId) {
      return tasks.filter(t => t.assigneeId === filterEmployeeId);
    }
    return tasks;
  }, [tasks, currentUserProfile, currentUserId, filterEmployeeId]);

  if (!isRegistered && !loading) {
    return (
      <div className="flex flex-col h-screen bg-[#fcfdff] px-8 justify-center items-center text-center animate-fade-up">
        <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 mb-10 rotate-3">
          <Zap size={50} fill="white" />
        </div>
        
        {onboardingStep === 'choice' ? (
          <div className="space-y-8 w-full max-w-sm">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">1C Matrix</h1>
              <p className="text-slate-400 font-bold text-sm">Система управления вашей командой</p>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={handleCreateTeam}
                className="w-full bg-white p-6 rounded-[32px] border-2 border-slate-100 hover:border-indigo-600 transition-all flex items-center gap-5 group shadow-sm text-left active:scale-[0.97]"
              >
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Shield size={28} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800">Я Администратор</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Создать пространство</p>
                </div>
                <ArrowRight size={20} className="ml-auto text-slate-200 group-hover:text-indigo-600 transition-all" />
              </button>

              <button 
                onClick={() => setOnboardingStep('invite_input')}
                className="w-full bg-white p-6 rounded-[32px] border-2 border-slate-100 hover:border-amber-500 transition-all flex items-center gap-5 group shadow-sm text-left active:scale-[0.97]"
              >
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <UserIcon size={28} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800">Я Исполнитель</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Вступить в команду</p>
                </div>
                <ArrowRight size={20} className="ml-auto text-slate-200 group-hover:text-amber-500 transition-all" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 w-full max-w-sm animate-fade-up">
            <button onClick={() => setOnboardingStep('choice')} className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-colors">← Назад</button>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Приглашение</h2>
              <p className="text-slate-400 font-bold text-sm">Вставьте ссылку, полученную от админа</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"><LinkIcon size={18} /></div>
                <input 
                  type="text" 
                  value={inviteLinkInput}
                  onChange={(e) => { setInviteLinkInput(e.target.value); setInviteError(''); }}
                  placeholder="https://t.me/matrix_bot?..."
                  className="w-full bg-white border-2 border-slate-100 focus:border-indigo-500 px-12 py-5 rounded-[24px] outline-none font-bold text-sm shadow-sm transition-all"
                />
              </div>
              {inviteError && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider">{inviteError}</p>}
              <button 
                onClick={handleJoinTeam}
                disabled={!inviteLinkInput}
                className={`w-full py-5 rounded-[24px] font-black text-sm shadow-xl transition-all active:scale-95 ${inviteLinkInput ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}
              >
                Войти в систему
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
            <p className="font-black text-sm">Вы успешно вошли!</p>
            <p className="text-[10px] font-bold opacity-80">Идентификатор команды: {teamId?.split('_')[1]}</p>
          </div>
          <button onClick={() => setShowWelcome(false)} className="ml-auto opacity-70"><Plus className="rotate-45" size={20} /></button>
        </div>
      )}

      <header className="sticky top-0 z-30 px-6 pt-10 pb-4 flex items-center justify-between bg-white border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Zap size={22} fill="white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">1C Matrix</h1>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Globe size={10} className="text-indigo-500" />
              <span>Team: {teamId?.split('_')[1]}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
           <p className="text-[11px] font-black text-slate-800">{currentUserProfile?.fullName || 'User'}</p>
           <p className={`text-[9px] font-bold uppercase tracking-wider ${currentUserProfile?.accessLevel === AccessLevel.ADMIN ? 'text-indigo-600' : 'text-amber-500'}`}>{currentUserProfile?.accessLevel}</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
        <div className="animate-fade-up py-4">
          {activeTab === 'tasks' && (
            <TaskBoard 
              tasks={visibleTasks} 
              onDelete={(id) => setTasks(prev => prev.filter(t => t.id !== id))} 
              onTaskClick={setSelectedTask}
              filterEmployeeName={employees.find(e => e.id === filterEmployeeId)?.fullName}
            />
          )}
          {activeTab === 'employees' && (
            <EmployeeManager 
              employees={employees} 
              onEdit={(emp) => { setEditingEmployee(emp); setIsEmployeeModalOpen(true); }} 
              onAdd={() => { setEditingEmployee(null); setIsEmployeeModalOpen(true); }} 
              onDelete={(id) => setEmployees(prev => prev.filter(e => e.id !== id))}
              onViewTasks={(id) => { setFilterEmployeeId(id); setActiveTab('tasks'); }}
              isAdmin={currentUserProfile?.accessLevel === AccessLevel.ADMIN}
              teamId={teamId || ''}
            />
          )}
          {activeTab === 'dashboard' && <Dashboard tasks={tasks} employees={employees} />}
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
      {isEmployeeModalOpen && <EmployeeEditor employee={editingEmployee} onClose={() => { setIsEmployeeModalOpen(false); setEditingEmployee(null); }} onSave={(e) => {
         if (editingEmployee) setEmployees(prev => prev.map(em => em.id === editingEmployee.id ? { ...em, ...e } as Employee : em));
         else setEmployees(prev => [...prev, { ...e, id: Date.now(), isActive: true, loadPercentage: 0 } as Employee]);
         setIsEmployeeModalOpen(false);
      }} />}
      {selectedTask && (
        <TaskDetails 
          task={selectedTask} 
          currentUser={currentUserProfile || ({} as any)} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={(ut) => setTasks(prev => prev.map(t => t.id === ut.id ? ut : t))} 
          onDelete={(id) => { setTasks(prev => prev.filter(t => t.id !== id)); setSelectedTask(null); }} 
          isAdmin={currentUserProfile?.accessLevel === AccessLevel.ADMIN} 
        />
      )}
    </div>
  );
};

export default App;
