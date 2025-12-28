
import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, Mail, Phone, Code2, ShieldCheck, ChevronDown } from 'lucide-react';
import { Employee, AccessLevel } from '../types';

interface EmployeeEditorProps {
  employee: Employee | null;
  onClose: () => void;
  onSave: (emp: Partial<Employee>) => void;
}

const EmployeeEditor: React.FC<EmployeeEditorProps> = ({ employee, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Employee>>({
    fullName: '',
    role: '',
    email: '',
    phone: '',
    skills: [],
    accessLevel: AccessLevel.EXECUTOR,
    isActive: true,
  });

  const [skillsInput, setSkillsInput] = useState('');

  useEffect(() => {
    if (employee) {
      setFormData({ ...employee });
      setSkillsInput(employee.skills.join(', '));
    }
  }, [employee]);

  const handleSave = () => {
    if (!formData.fullName) return;
    
    const processedSkills = skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    onSave({
      ...formData,
      skills: processedSkills,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex flex-col justify-end p-0 sm:p-4">
      <div className="bg-slate-50 rounded-t-[42px] sm:rounded-[42px] max-h-[95vh] w-full max-w-2xl mx-auto flex flex-col animate-fade-up overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.2)]">
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-4 mb-2 shrink-0"></div>
        
        <div className="px-8 py-4 flex items-center justify-between shrink-0">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
            <X size={20} />
          </button>
          <h2 className="text-xl font-black text-slate-800">
            {employee ? 'Редактировать сотрудника' : 'Новый сотрудник'}
          </h2>
          <button 
            onClick={handleSave}
            disabled={!formData.fullName}
            className={`px-6 py-2.5 rounded-2xl text-sm font-black shadow-lg transition-all active:scale-95 ${
              formData.fullName 
                ? 'bg-indigo-600 text-white shadow-indigo-600/30' 
                : 'bg-slate-200 text-slate-400 shadow-none'
            }`}
          >
            Сохранить
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar pb-12">
          {/* Name & Role */}
          <div className="space-y-4">
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ФИО сотрудника</label>
               <div className="relative group">
                 <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                 <input 
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Иван Иванов"
                  className="w-full bg-white border-2 border-transparent pl-14 pr-6 py-4 rounded-[24px] outline-none focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 text-base font-bold shadow-sm transition-all placeholder:text-slate-200"
                />
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Должность</label>
               <div className="relative group">
                 <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                 <input 
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="Например: Senior Frontend Developer"
                  className="w-full bg-white border-2 border-transparent pl-14 pr-6 py-4 rounded-[24px] outline-none focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 text-base font-bold shadow-sm transition-all placeholder:text-slate-200"
                />
               </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative group">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                 <input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="ivan@corp.ru"
                  className="w-full bg-white border-2 border-transparent pl-12 pr-4 py-4 rounded-[22px] outline-none focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 text-sm font-bold shadow-sm transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Телефон</label>
              <div className="relative group">
                 <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                 <input 
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+7 (999) 000-00-00"
                  className="w-full bg-white border-2 border-transparent pl-12 pr-4 py-4 rounded-[22px] outline-none focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 text-sm font-bold shadow-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Навыки (через запятую)</label>
            <div className="relative group">
               <Code2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
               <input 
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="React, TypeScript, Figma..."
                className="w-full bg-white border-2 border-transparent pl-14 pr-6 py-4 rounded-[24px] outline-none focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 text-sm font-bold shadow-sm transition-all placeholder:text-slate-200"
              />
            </div>
          </div>

          {/* Access Level */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Уровень доступа</label>
            <div className="flex gap-2">
              {[AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.EXECUTOR].map(level => (
                <button
                  key={level}
                  onClick={() => setFormData(prev => ({ ...prev, accessLevel: level }))}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-tight transition-all border-2 ${
                    formData.accessLevel === level 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                      : 'bg-white border-white text-slate-400 hover:border-slate-100 shadow-sm'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Status Toggle */}
          <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Активный сотрудник</p>
                <p className="text-[10px] text-slate-400 font-medium">Отображать в списках назначения</p>
              </div>
            </div>
            <button 
              onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
              className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${formData.isActive ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${formData.isActive ? 'translate-x-7' : 'translate-x-1'}`}></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeEditor;
