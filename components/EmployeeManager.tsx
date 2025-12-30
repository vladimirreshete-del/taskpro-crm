
import React from 'react';
import { Edit2, Plus, Trash2, Eye, ShieldCheck, UserCheck } from 'lucide-react';
import { Employee, AccessLevel } from '../types';

interface EmployeeManagerProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
  onViewTasks: (id: number) => void;
  isAdmin: boolean;
  teamId: string;
}

const EmployeeManager: React.FC<EmployeeManagerProps> = ({ employees, onEdit, onAdd, onDelete, onViewTasks, isAdmin }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 px-1">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Команда</h2>
            <p className="text-sm text-slate-400 font-medium tracking-tight">Активных участников: {employees.length}</p>
          </div>
          {isAdmin && (
            <button 
              onClick={onAdd}
              className="flex items-center gap-2 text-indigo-600 font-bold text-xs bg-indigo-50 px-4 py-2.5 rounded-xl border border-indigo-100 shadow-sm active:scale-95"
            >
              <Plus size={14} strokeWidth={3} /> Добавить участника
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {employees.map(emp => (
          <div key={emp.id} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm relative group hover:border-indigo-100 transition-all">
            <div className="flex gap-4 items-center">
              <div className="shrink-0 relative">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white text-lg font-black shadow-md ${
                  emp.accessLevel === AccessLevel.ADMIN ? 'from-indigo-600 to-indigo-800' : 'from-slate-400 to-slate-600'
                }`}>
                  {emp.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                {emp.isActive && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-base text-slate-900 truncate">{emp.fullName}</h4>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${
                      emp.accessLevel === AccessLevel.ADMIN ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                      {emp.role}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {isAdmin ? (
                      <>
                        <button onClick={() => onEdit(emp)} className="p-2.5 text-slate-300 hover:text-indigo-600 bg-slate-50 rounded-xl">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => onDelete(emp.id)} className="p-2.5 text-slate-300 hover:text-rose-500 bg-slate-50 rounded-xl">
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      emp.accessLevel === AccessLevel.ADMIN ? <ShieldCheck size={18} className="text-indigo-200" /> : <UserCheck size={18} className="text-slate-200" />
                    )}
                  </div>
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
