
import React from 'react';
import { User2, Mail, Phone, ExternalLink, Zap } from 'lucide-react';
import { Employee, AccessLevel } from '../types';

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 1,
    fullName: 'Александр Волков',
    role: 'Lead Fullstack',
    email: 'volkov@company.com',
    phone: '+7 900 123-45-67',
    hireDate: '2021-01-15',
    isActive: true,
    accessLevel: AccessLevel.ADMIN,
    skills: ['Python', 'React'],
    loadPercentage: 88
  },
  {
    id: 2,
    fullName: 'Мария Кузнецова',
    role: 'Product Designer',
    email: 'kuznetsova@company.com',
    phone: '+7 900 987-65-43',
    hireDate: '2022-03-10',
    isActive: true,
    accessLevel: AccessLevel.MANAGER,
    skills: ['Figma', 'UI/UX'],
    loadPercentage: 42
  }
];

const EmployeeManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black">Команда</h2>
          <p className="text-sm text-slate-400 font-medium">Активных участников: 12</p>
        </div>
        <button className="text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-xl">Нанять</button>
      </div>

      <div className="grid gap-4">
        {MOCK_EMPLOYEES.map(emp => (
          <div key={emp.id} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
            {/* Background Decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-5 ${emp.loadPercentage > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
            
            <div className="flex gap-4 relative z-10">
              <div className="shrink-0 relative">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white text-xl font-bold shadow-lg ${
                  emp.id === 1 ? 'from-indigo-500 to-blue-600' : 'from-rose-400 to-orange-500'
                }`}>
                  {emp.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg text-slate-800">{emp.fullName}</h4>
                <div className="flex items-center gap-2 text-slate-400 mb-4">
                  <Zap size={12} className="text-indigo-500 fill-indigo-500" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">{emp.role}</span>
                </div>
                
                <div className="space-y-3">
                   <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Загрузка</span>
                      <span className={emp.loadPercentage > 80 ? 'text-rose-500' : 'text-emerald-500'}>{emp.loadPercentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${emp.loadPercentage > 80 ? 'bg-rose-500' : 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]'}`} 
                        style={{ width: `${emp.loadPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
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
