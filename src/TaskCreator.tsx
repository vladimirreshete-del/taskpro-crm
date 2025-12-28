import React, { useState } from 'react';
import { X, Calendar, User, Zap, ChevronDown } from 'lucide-react';
import { Task } from '../types';

interface TaskCreatorProps {
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
}

const TaskCreator: React.FC<TaskCreatorProps> = ({ onClose, onSave }) => {
  const [priority, setPriority] = useState(3);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('28 Мая');
  
  const handleCreate = () => {
    if (!title.trim()) return;
    onSave({
      title,
      priority: priority as any,
      deadline,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex flex-col justify-end p-0 sm:p-4">
      <div className="bg-slate-50 rounded-t-[42px] sm:rounded-[42px] max-h-[95vh] w-full max-w-2xl mx-auto flex flex-col animate-fade-up overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.2)]">
        {/* Handle for mobile */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-4 mb-2 shrink-0"></div>
        
        {/* Header */}
        <div className="px-8 py-4 flex items-center justify-between shrink-0">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
            <X size={20} />
          </button>
          <h2 className="text-xl font-black text-slate-800">Новая задача</h2>
          <button 
            onClick={handleCreate}
            disabled={!title.trim()}
            className={`px-6 py-2.5 rounded-2xl text-sm font-black shadow-lg transition-all active:scale-95 ${
              title.trim() 
                ? 'bg-indigo-600 text-white shadow-indigo-600/30' 
                : 'bg-slate-200 text-slate-400 shadow-none'
            }`}
          >
            Готово
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar pb-12">
          {/* Main Input */}
          <div className="space-y-3">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Как назовем задачу?</label>
             <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название..."
              className="w-full bg-white border-2 border-transparent px-6 py-5 rounded-[24px] outline-none focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 text-lg font-bold shadow-sm transition-all placeholder:text-slate-300"
              autoFocus
            />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm space-y-2">
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
            
            <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm space-y-2">
               <div className="flex items-center gap-2 text-emerald-500">
                  <User size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Исполнитель</span>
               </div>
               <div className="flex items-center justify-between text-slate-800 font-bold cursor-pointer">
                 <span>Александр Волков</span>
                 <ChevronDown size={14} className="text-slate-400" />
               </div>
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Важность проекта</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-4 rounded-2xl text-xs font-black transition-all border-2 ${
                    priority === p 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                      : 'bg-white border-white text-slate-400 hover:border-slate-100 shadow-sm'
                  }`}
                >
                  P{p}
                </button>
              ))}
            </div>
          </div>

          {/* AI Helper Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-[32px] shadow-xl shadow-indigo-600/20 text-white relative overflow-hidden group">
            <Zap className="absolute -right-6 -bottom-6 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform duration-500" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <Zap size={16} fill="white" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">AI Рекомендация</span>
            </div>
            <p className="text-sm font-medium leading-relaxed text-indigo-100 relative z-10">
              На основе сложности задачи советуем выбрать <span className="text-white font-bold underline decoration-white/30">Марию К.</span> — у неё 100% выполнения подобных тасков в срок.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCreator;