
import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Link2, CheckCircle2 } from 'lucide-react';
import { Employee, AccessLevel } from '../types';

interface EmployeeEditorProps {
  employee: Employee | null;
  teamId: string;
  onClose: () => void;
  onSave: (emp: Partial<Employee>) => void;
}

const EmployeeEditor: React.FC<EmployeeEditorProps> = ({ employee, teamId, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Employee>>({
    fullName: '',
    role: '',
    email: '',
    phone: '',
    skills: [],
    accessLevel: AccessLevel.EXECUTOR,
    isActive: true,
  });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (employee) setFormData({ ...employee });
  }, [employee]);

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}${window.location.pathname}?invite=executor&teamId=${teamId}`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      const tg = (window as any).Telegram?.WebApp;
      if (tg) tg.HapticFeedback?.notificationOccurred('success');
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex flex-col justify-end p-0 sm:p-4">
      <div className="bg-slate-50 rounded-t-[42px] sm:rounded-[42px] max-h-[95vh] w-full max-w-2xl mx-auto flex flex-col animate-fade-up overflow-hidden shadow-xl">
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-4 mb-2 shrink-0"></div>
        <div className="px-8 py-4 flex items-center justify-between">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 border border-slate-100"><X size={20} /></button>
          <h2 className="text-xl font-black text-slate-800">{employee ? 'Редактировать' : 'Добавить в команду'}</h2>
          <button onClick={() => onSave(formData)} disabled={!formData.fullName} className={`px-6 py-2.5 rounded-2xl text-sm font-black ${formData.fullName ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}>Готово</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar pb-12">
          {!employee && (
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Быстрое приглашение</p>
              <button 
                onClick={handleCopyInvite}
                className={`w-full flex items-center justify-center gap-3 py-5 rounded-[24px] font-black text-sm transition-all border-2 ${copied ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-white border-indigo-100 text-indigo-600 shadow-sm'}`}
              >
                {copied ? <><CheckCircle2 size={18} /> Ссылка скопирована!</> : <><Link2 size={18} /> Копировать ссылку для входа</>}
              </button>
              <p className="text-[9px] text-slate-400 font-medium text-center px-4">Отправьте эту ссылку сотруднику, чтобы он автоматически присоединился к вашей команде.</p>
            </div>
          )}

          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ФИО сотрудника</label>
               <input type="text" value={formData.fullName} onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))} placeholder="Иван Иванов" className="w-full bg-white border-2 border-transparent px-6 py-4 rounded-[24px] outline-none focus:border-indigo-500/30 font-bold shadow-sm" />
            </div>
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Должность / Роль</label>
               <input type="text" value={formData.role} onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))} placeholder="Программист 1С" className="w-full bg-white border-2 border-transparent px-6 py-4 rounded-[24px] outline-none focus:border-indigo-500/30 font-bold shadow-sm" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Уровень доступа</label>
            <div className="flex gap-2">
              {[AccessLevel.ADMIN, AccessLevel.EXECUTOR].map(level => (
                <button key={level} onClick={() => setFormData(prev => ({ ...prev, accessLevel: level }))} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-tight transition-all border-2 ${formData.accessLevel === level ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-white text-slate-400'}`}>{level}</button>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}><ShieldCheck size={20} /></div>
              <div><p className="text-sm font-bold text-slate-800">Статус аккаунта</p><p className="text-[10px] font-bold text-slate-400">{formData.isActive ? 'Активен' : 'Заблокирован'}</p></div>
            </div>
            <button onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))} className={`w-14 h-8 rounded-full relative transition-colors ${formData.isActive ? 'bg-indigo-600' : 'bg-slate-200'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${formData.isActive ? 'translate-x-7' : 'translate-x-1'}`}></div></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeEditor;
