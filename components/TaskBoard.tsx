
import React, { useState, useMemo } from 'react';
import { Calendar, ChevronRight, Hash, Layers, Building2, User } from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface TaskBoardProps {
  tasks: Task[];
  onDelete: (id: number) => void;
  onTaskClick: (task: Task) => void;
  filterEmployeeName?: string;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onDelete, onTaskClick, filterEmployeeName }) => {
  const [activeTab, setActiveTab] = useState<'NEW' | 'IN_PROGRESS' | 'DONE_CANCELLED'>('IN_PROGRESS');

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (activeTab === 'NEW') return t.status === TaskStatus.NEW;
      if (activeTab === 'IN_PROGRESS') return t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.ON_REVIEW;
      if (activeTab === 'DONE_CANCELLED') return t.status === TaskStatus.DONE || t.status === TaskStatus.CANCELLED;
      return true;
    });
  }, [tasks, activeTab]);

  const getPriorityStyles = (p: string) => {
    if (p === 'Ключевая') return 'text-rose-600 bg-rose-50 border-rose-100';
    if (p === 'Срочная') return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-indigo-600 bg-indigo-50 border-indigo-100';
  };

  return (
    <div className="space-y-6 pt-2">
      {filterEmployeeName && (
        <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
          <p className="text-xs font-bold text-indigo-600">Сотрудник: {filterEmployeeName}</p>
        </div>
      )}

      <div className="flex bg-slate-200/50 p-1 rounded-2xl gap-1">
        <button onClick={() => setActiveTab('NEW')} className={`flex-1 py-2.5 text-[11px] font-extrabold uppercase tracking-tight rounded-xl transition-all ${activeTab === 'NEW' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Новые</button>
        <button onClick={() => setActiveTab('IN_PROGRESS')} className={`flex-1 py-2.5 text-[11px] font-extrabold uppercase tracking-tight rounded-xl transition-all ${activeTab === 'IN_PROGRESS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>В работе</button>
        <button onClick={() => setActiveTab('DONE_CANCELLED')} className={`flex-1 py-2.5 text-[11px] font-extrabold uppercase tracking-tight rounded-xl transition-all ${activeTab === 'DONE_CANCELLED' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Выполнены</button>
      </div>

      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <div 
              key={task.id} 
              onClick={() => onTaskClick(task)}
              className="group bg-white p-5 rounded-[28px] border border-slate-200/60 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                    <Hash size={10} strokeWidth={3} /> {task.displayId}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${getPriorityStyles(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <ChevronRight size={18} />
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-indigo-500 mb-2">
                <Building2 size={12} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-wider truncate max-w-[200px]">{task.organizationName}</span>
              </div>

              <h3 className="text-[17px] font-extrabold text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                {task.title}
              </h3>
              
              <p className="text-xs text-slate-400 line-clamp-1 font-medium mb-4 italic">
                {task.description || "Описание отсутствует"}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                     <User size={10} />
                   </div>
                   <span className="text-[10px] font-bold text-slate-500">{task.assigneeName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100/50">
                  <Calendar size={13} className="text-indigo-500" />
                  <span className="text-[11px] font-bold">{task.deadline}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
              <Layers size={32} />
            </div>
            <p className="text-slate-400 font-bold text-sm">Здесь пока пусто</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskBoard;
