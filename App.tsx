
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LayoutGrid, Users, BarChart3, Plus, Zap, CheckCircle2, Shield, User as UserIcon, ArrowRight, Link as LinkIcon, Globe, RefreshCw } from 'lucide-react';
import TaskBoard from './components/TaskBoard';
import EmployeeManager from './components/EmployeeManager';
import Dashboard from './components/Dashboard';
import TaskCreator from './components/TaskCreator';
import EmployeeEditor from './components/EmployeeEditor';
import TaskDetails from './components/TaskDetails';
import { Task, TaskStatus, Employee, AccessLevel } from './types';

// Конфигурация API
const API_URL = (window as any).VITE_API_URL || 'https://crm-backend.onrender.com/api/v1';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'employees' | 'dashboard'>('tasks');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [filterEmployeeId, setFilterEmployeeId] = useState<number | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
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
      const response = await fetch(`${API_URL}/sync/?team_id=${activeTeamId}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
      setLoading(false);
    }
  }, [teamId]);

  const pushData = useCallback(async (updatedTasks: Task[], updatedEmps: Employee[]) => {
    if (!teamId) return;
    
    // Сначала обновляем локально для мгновенного отклика
    setTasks(updatedTasks);
    setEmployees(updatedEmps);

    try {
      await fetch(`${API_URL}/sync/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: teamId,
          tasks: updatedTasks,
          employees: updatedEmps
        })
      });
    } catch (error) {
      console.error("Push error:", error);
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
      }
    } else {
      setLoading(false);
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('invite') === 'executor' && params.get('teamId')) {
      setInviteLinkInput(window.location.href);
      setOnboardingStep('invite_input');
    }

    const interval = setInterval(() => syncData(), 5000); // Опрос каждые 5 сек
    return () => clearInterval(interval);
  }, [syncData]);

  const handleTabChange = useCallback((tab: 'tasks' | 'employees' | 'dashboard') => {
    setActiveTab(tab);
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
  }, [tg]);

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
        setInviteError('Ссылка не содержит ID команды.');
        return;
      }

      setTeamId(extractedTeamId);
      localStorage.setItem('matrix_current_team_id', extractedTeamId);
      localStorage.setItem('matrix_is_registered', 'true');

      // Сначала получаем данные команды
      const response = await fetch(`${API_URL}/sync/?team_id=${extractedTeamId}`);
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

      const updatedEmps = [...data.employees];
      if (!updatedEmps.find(e => e.id === currentUserId)) {
        updatedEmps.push(executor);
      }

      await pushData(data.tasks, updatedEmps);
      setIsRegistered(true);
      setShowWelcome(true);
      tg?.HapticFeedback?.notificationOccurred('success');
    } catch (e) {
      setInviteError('Введите корректную ссылку.');
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

  const visibleTasks = useMemo(() => {
    if (currentUserProfile?.accessLevel === AccessLevel.EXECUTOR) {
      return tasks.filter(t => t.assigneeId === currentUserId);
    }
    if (filterEmployeeId) return tasks.filter(t => t.assigneeId === filterEmployeeId);
    return tasks;
  }, [tasks, currentUserProfile, currentUserId, filterEmployeeId]);

  if (!isRegistered && !loading) {
    return (
      <div className="flex flex-col h-screen bg-white px-8 justify-center items-center text-center animate-fade-up">
        <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl mb-10 rotate-3">
          <Zap size={50} fill="white" />
        </div>
        {onboardingStep === 'choice' ? (
          <div className="space-y-8 w-full max-w-sm">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">1C Matrix</h1>
            <div className="space-y-4">
              <button onClick={handleCreateTeam} className="w-full bg-slate-50 p-6 rounded-[32px] border-2 border-transparent hover:border-indigo-600 transition-all flex items-center gap-5 group text-left active:scale-95 shadow-sm">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Shield size={28} /></div>
                <div><h3 className="font-black text-slate-800">Администратор</h3><p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Создать команду</p></div>
                <ArrowRight size={20} className="ml-auto text-slate-200 group-hover:text-indigo-600" />
              </button>
              <button onClick={() => setOnboardingStep('invite_input')} className="w-full bg-slate-50 p-6 rounded-[32px] border-2 border-transparent hover:border-amber-500 transition-all flex items-center gap-5 group text-left active:scale-95 shadow-sm">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all"><UserIcon size={28} /></div>
                <div><h3 className="font-black text-slate-800">Исполнитель</h3><p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Вступить в команду</p></div>
                <ArrowRight size={20} className="ml-auto text-slate-200 group-hover:text-amber-500" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 w-full max-w-sm animate-fade-up">
            <button onClick={() => setOnboardingStep('choice')} className="text-slate-400 font-bold text-xs uppercase hover:text-indigo-600 transition-colors">← Назад</button>
            <div className="space-y-2"><h2 className="text-2xl font-black text-slate-900">Приглашение</h2><p className="text-slate-400 font-bold text-sm">Вставьте ссылку от руководителя</p></div>
            <div className="space-y-4">
              <div className="relative"><div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"><LinkIcon size={18} /></div>
                <input type="text" value={inviteLinkInput} onChange={(e) => { setInviteLinkInput(e.target.value); setInviteError(''); }} placeholder="https://..." className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 px-12 py-5 rounded-[24px] outline-none font-bold text-sm transition-all" />
              </div>
              {inviteError && <p className="text-rose-500 text-[10px] font-black uppercase">{inviteError}</p>}
              <button onClick={handleJoinTeam} disabled={!inviteLinkInput} className={`w-full py-5 rounded-[24px] font-black text-sm transition-all active:scale-95 ${inviteLinkInput ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-200 text-slate-400'}`}>Присоединиться</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#f8fafc]">
      {showWelcome && (
        <div className="fixed top-24 left-6 right-6 z-[200] bg-emerald-600 text-white p-4 rounded-2xl shadow-2xl animate-fade-up flex items-center gap-3">
          <CheckCircle2 size={24} /><div><p className="font-black text-sm">Вы в команде!</p><p className="text-[10px] font-bold opacity-80">Синхронизация активна</p></div>
          <button onClick={() => setShowWelcome(false)} className="ml-auto opacity-70"><Plus className="rotate-45" size={20} /></button>
        </div>
      )}

      <header className="sticky top-0 z-30 px-6 pt-10 pb-4 flex items-center justify-between bg-white border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Zap size={22} fill="white" /></div>
          <div><h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">1C Matrix</h1>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {isSyncing ? <RefreshCw size={10} className="animate-spin text-indigo-500" /> : <Globe size={10} className="text-emerald-500" />}
              <span>ID: {teamId?.split('_')[1]}</span>
            </div>
          </div>
        </div>
        <div className="text-right"><p className="text-[11px] font-black text-slate-800">{currentUserProfile?.fullName || 'User'}</p>
          <p className={`text-[9px] font-bold uppercase ${currentUserProfile?.accessLevel === AccessLevel.ADMIN ? 'text-indigo-600' : 'text-amber-500'}`}>{currentUserProfile?.accessLevel}</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
        <div className="animate-fade-up py-4">
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <>
              {activeTab === 'tasks' && <TaskBoard tasks={visibleTasks} onDelete={(id) => pushData(tasks.filter(t => t.id !== id), employees)} onTaskClick={setSelectedTask} filterEmployeeName={employees.find(e => e.id === filterEmployeeId)?.fullName} />}
              {activeTab === 'employees' && <EmployeeManager employees={employees} onEdit={(emp) => { setEditingEmployee(emp); setIsEmployeeModalOpen(true); }} onAdd={() => { setEditingEmployee(null); setIsEmployeeModalOpen(true); }} onDelete={(id) => pushData(tasks, employees.filter(e => e.id !== id))} onViewTasks={(id) => { setFilterEmployeeId(id); setActiveTab('tasks'); }} isAdmin={currentUserProfile?.accessLevel === AccessLevel.ADMIN} teamId={teamId || ''} />}
              {activeTab === 'dashboard' && <Dashboard tasks={tasks} employees={employees} />}
            </>
          )}
        </div>
      </main>

      {activeTab === 'tasks' && currentUserProfile?.accessLevel === AccessLevel.ADMIN && !isTaskModalOpen && (
        <button onClick={() => setIsTaskModalOpen(true)} className="fixed bottom-28 right-6 w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-xl flex items-center justify-center z-40 active:scale-95"><Plus size={32} /></button>
      )}

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
        <nav className="bg-white/95 backdrop-blur-2xl rounded-[32px] border border-slate-200 shadow-xl p-2 flex justify-between items-center">
          <button onClick={() => handleTabChange('tasks')} className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[24px] ${activeTab === 'tasks' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}><LayoutGrid size={22} /><span className="text-[10px] font-bold">Задачи</span></button>
          <button onClick={() => handleTabChange('employees')} className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[24px] ${activeTab === 'employees' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}><Users size={22} /><span className="text-[10px] font-bold">Команда</span></button>
          {currentUserProfile?.accessLevel === AccessLevel.ADMIN && (
            <button onClick={() => handleTabChange('dashboard')} className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[24px] ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}><BarChart3 size={22} /><span className="text-[10px] font-bold">Анализ</span></button>
          )}
        </nav>
      </div>

      {isTaskModalOpen && <TaskCreator employees={employees} onClose={() => setIsTaskModalOpen(false)} onSave={addTask} />}
      {isEmployeeModalOpen && <EmployeeEditor employee={editingEmployee} teamId={teamId || ''} onClose={() => { setIsEmployeeModalOpen(false); setEditingEmployee(null); }} onSave={(e) => {
         let updatedEmps;
         if (editingEmployee) updatedEmps = employees.map(em => em.id === editingEmployee.id ? { ...em, ...e } as Employee : em);
         else updatedEmps = [...employees, { ...e, id: Date.now(), isActive: true, loadPercentage: 0 } as Employee];
         pushData(tasks, updatedEmps);
         setIsEmployeeModalOpen(false);
      }} />}
      {selectedTask && <TaskDetails task={selectedTask} currentUser={currentUserProfile || ({} as any)} onClose={() => setSelectedTask(null)} onUpdate={(ut) => pushData(tasks.map(t => t.id === ut.id ? ut : t), employees)} onDelete={(id) => { pushData(tasks.filter(t => t.id !== id), employees); setSelectedTask(null); }} isAdmin={currentUserProfile?.accessLevel === AccessLevel.ADMIN} />}
    </div>
  );
};

export default App;
