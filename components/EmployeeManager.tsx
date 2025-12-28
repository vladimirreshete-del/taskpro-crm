
import React from 'react';
import { Zap, ExternalLink, Edit2, Plus, Link2 } from 'lucide-react';
import { Employee, AccessLevel } from '../types';

interface EmployeeManagerProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onAdd: () => void;
}

const EmployeeManager: React.FC<EmployeeManagerProps> = ({ employees, onEdit, onAdd }) => {
  const handleAddByLink = () => {
    const url = prompt('Введите ссылку на профиль Telegram или Username (например, t.me/username):');
    if (!url) return;

    let username = '';
    let telegramUrl = '';

    if (url.includes('t.me/')) {
      username = url.split('t.me/')[1].split('/')[0];
      telegramUrl = `https://t.me/${username}`;
    } else if (url.startsWith('@')) {
      username = url.slice(1);
      telegramUrl = `https://t.me/${username}`;
    } else {
      username = url;
      telegramUrl = `https://t.me/${username}`;
    }

    onEdit({
      id: Date.now(),
      fullName: username.charAt(0).toUpperCase() + username.slice(1),
      role: 'Новый участник',
      email: '',
      phone: '',
      telegramUrl: telegramUrl,
      hireDate: new Date().toISOString().split('T')[0],
      isActive: true,
      accessLevel: AccessLevel.EXECUTOR,
      skills: [],
      loadPercentage: 0
    } as Employee);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 px-1">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Команда</h2>
            <p className="text-sm text-slate-400 font-medium">Активных участников: {employees.length}</p>
          </div>
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 text-indigo-600 font-bold text-xs bg-indigo-50 px-4 py-2.5 rounded-xl border border-indigo-100 shadow-sm transition-transform active:scale-95"
          >
            <Plus size={14} strokeWidth={3} />
            Пригласить
          </button>
        </div>
        <button 
          onClick={handleAddByLink}
          className="w-full flex items-center justify-center gap-2 py-4 bg-white border-2 border-dashed border-slate-200 rounded-[24px] text-slate-400 font-bold text-xs hover:border-indigo-300 hover:text-indigo-500 transition-all active:scale-95"
        >
          <Link2 size={16} />
          Добавить через Telegram Link
        </button>
      </div>

      <div className="grid gap-4">
        {employees.map(emp => (
          <div key={emp.id} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all">
            <div className="flex gap-4 relative z-10">
              <div className="shrink-0 relative">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white text-xl font-bold shadow-lg ${
                  emp.accessLevel === AccessLevel.ADMIN ? 'from-indigo-600 to-violet-700' : 'from-slate-400 to-slate-500'
                }`}>
                  {emp.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                {emp.isActive && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-lg text-slate-800 truncate">{emp.fullName}</h4>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(emp)} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    {emp.telegramUrl && (
                      <a href={emp.telegramUrl} target="_blank" rel="noreferrer" className="p-2 text-slate-300 hover:text-indigo-500 transition-colors">
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400 mt-1">
                  <Zap size={12} className="text-indigo-500 fill-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider">{emp.role}</span>
                  <span className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase">{emp.accessLevel}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeManager;
