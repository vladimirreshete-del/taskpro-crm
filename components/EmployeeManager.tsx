
import React from 'react';
import { User2, Mail, Phone, Zap, ExternalLink } from 'lucide-react';
import { Employee } from '../types';

interface EmployeeManagerProps {
  employees: Employee[];
}

const EmployeeManager: React.FC<EmployeeManagerProps> = ({ employees }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between px-1">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Команда</h2>
          <p className="text-sm text-slate-400 font-medium">Активных участников: {employees.length}</p>
        </div>
        <button className="text-indigo-600 font-bold text-xs bg-indigo-50 px-4 py-2.5 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors">
          Пригласить
        </button>
      </div>

      <div className="grid gap-4">
        {employees.map(emp => (
          <div key={emp.id} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all">
            {/* Background Decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-[0.03] transition-transform group-hover:scale-110 ${emp.loadPercentage > 80 ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
            
            <div className="flex gap-4 relative z-10">
              <div className="shrink-0 relative">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white text-xl font-bold shadow-lg ${
                  emp.id % 2 === 0 ? 'from-indigo-500 to-blue-600' : 'from-rose-400 to-orange-500'
                }`}>
                  {emp.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-lg text-slate-800 truncate">{emp.fullName}</h4>
                  <button className="text-slate-300 hover:text-indigo-500">
                    <ExternalLink size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-slate-400 mb-4">
                  <Zap size={12} className="text-indigo-500 fill-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider">{emp.role}</span>
                </div>
                
                <div className="space-y-4">
                   <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                      <span>Загрузка по задачам</span>
                      <span className={emp.loadPercentage > 80 ? 'text-rose-500' : 'text-indigo-600'}>{emp.loadPercentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${emp.loadPercentage > 80 ? 'bg-rose-500' : 'bg-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.3)]'}`} 
                        style={{ width: `${emp.loadPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {emp.skills.map(skill => (
                      <span key={skill} className="text-[9px] font-black text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        {skill}
                      </span>
                    ))}
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
