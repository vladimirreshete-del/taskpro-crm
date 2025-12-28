
import React, { useState } from 'react';
import { X, Calendar, User, Zap, ChevronDown, Building2, MessageSquareText } from 'lucide-react';
import { Task, Employee } from '../types';

interface TaskCreatorProps {
  employees: Employee[];
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
}

const TaskCreator: React.FC<TaskCreatorProps> = ({ employees, onClose, onSave }) => {
  const [priority, setPriority] = useState(3);
  const [title, setTitle] = useState('');
  const [org, setOrg] = useState('');
  const [context, setContext] = useState('');
  const [assigneeId, setAssigneeId] = useState<number | null>(employees[0]?.id || null);
  const [deadline, setDeadline] = useState('28.05.2024');
  
  const handleCreate = () => {
    if (!title.trim()) return;
    onSave({
      title,
      organizationName: org,
      solutionContext: context,
      priority: priority as any,
      deadline,
      assigneeId: assigneeId || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex flex-col justify-end p-0 sm:p-4">
      <div className="bg-slate-50 rounded-t-[42px] sm:rounded-[42px] max-h-[95vh] w-full max-w-2xl mx-auto flex flex-col animate-fade-up overflow-hidden shadow-2xl">
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-4 mb-2 shrink-0"></div>
        
        <div className="px-8 py-4 flex items-center justify-between shrink-0">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
            <X size={20} />
          </button>
          <h2 className="text-xl font-black text-slate-800">Новая задача</h2>
          <button 
            onClick={handleCreate}
            disabled={!title.trim()}
            className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all ${
              title.trim() ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-200 text-slate-400'
            }`}
          >
            Создать
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar pb-12">
          {/* Organization */}
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
               <Building2 size={12} /> Название организации
             </label>
             <input 
              type="text"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="ООО 'ТехноМир'..."
              className="w-full bg-white border-2 border-transparent px-6 py-4 rounded-[20px] outline-none focus:border-indigo-500/30 text-base font-bold shadow-sm transition-all"
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Суть задачи</label>
             <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Что нужно сделать?"
              className="w-full bg-white border-2 border-transparent px-6 py-4 rounded-[20px] outline-none focus:border-indigo-500/30 text-base font-bold shadow-sm transition-all"
            />
          </div>

          {/* Context */}
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
               <MessageSquareText size={12} /> Что нужно решить? (Детали)
             </label>
             <textarea 
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Опишите технические детали или требования..."
              rows={3}
              className="w-full bg-white border-2 border-transparent px-6 py-4 rounded-[20px] outline-none focus:border-indigo-500/30 text-sm font-medium shadow-sm transition-all resize-none"
            />
          </div>

          {/* Deadline & Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm space-y-2">
               <div className="flex items-center gap-2 text-indigo-500">
                  <Calendar size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Дедлайн</span>
               </div>
               <input 
                type="text" 
                value={deadline} 
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-transparent font-bold text-slate-800 outline-none" 
               />
            </div>
            
            <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm space-y-2">
               <div className="flex items-center gap-2 text-emerald-500">
                  <User size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Исполнитель</span>
               </div>
               <select 
                 value={assigneeId || ''} 
                 onChange={(e) => setAssigneeId(Number(e.target.value))}
                 className="w-full bg-transparent font-bold text-slate-800 outline-none appearance-none cursor-pointer"
               >
                 {employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
               </select>
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Важность</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-3.5 rounded-xl text-xs font-black transition-all border-2 ${
                    priority === p 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                      : 'bg-white border-white text-slate-400 shadow-sm'
                  }`}
                >
                  P{p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCreator;
