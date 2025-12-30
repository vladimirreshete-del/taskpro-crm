
import React from 'react';
import { Zap, Edit2, Plus, Link2, Trash2, Eye } from 'lucide-react';
import { Employee, AccessLevel } from '../types';

interface EmployeeManagerProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
  onViewTasks: (id: number) => void;
  isAdmin: boolean;
}

const EmployeeManager: React.FC<EmployeeManagerProps> = ({ employees, onEdit, onAdd, onDelete, onViewTasks, isAdmin }) => {
  const handleInviteLink = () => {
    const inviteUrl = `${window.location.origin}${window.location.pathname}?invite=executor`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      alert("Пригласительная ссылка скопирована в буфер обмена! Отправьте её новому участнику.");
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 px-1">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Команда</h2>
            <p className="text-sm text-slate-400 font-medium">Активных участников: {employees.length}</p>
          </div>
          {isAdmin && (
            <button 
              onClick={onAdd}
              className="flex items-center gap-2 text-indigo-600 font-bold text-xs bg-indigo-50 px-4 py-2.5 rounded-xl border border-indigo-100 shadow-sm active:scale-95 transition-transform"
            >
              <Plus size={14} strokeWidth={3} /> Пригласить
            </button>
          )}
        </div>
        {isAdmin && (
          <button 
            onClick={handleInviteLink}
            className="w-full flex items-center justify-center gap-2 py-4 bg-white border-2 border-dashed border-slate-200 rounded-[24px] text-slate-400 font-bold text-xs hover:border-indigo-300 hover:text-indigo-500 transition-all active:scale-95"
          >
            <Link2 size={16} /> Копировать пригласительную ссылку
          </button>
        )}
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
                  <div>
                    <h4 className="font-bold text-lg text-slate-800 truncate">{emp.fullName}</h4>
                    <div className="flex items-center gap-2 text-slate-400 mt-1">
                      <Zap size={12} className="text-indigo-500 fill-indigo-500" />
                      <span className="text-[10px] font-black uppercase tracking-wider">{emp.role}</span>
                      <span className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase">{emp.accessLevel}</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => onViewTasks(emp.id)} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors" title="Задачи">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => onEdit(emp)} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => onDelete(emp.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
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
