
import React, { useState, useMemo } from 'react';
import { Calendar, ChevronRight, Hash, Layers, Trash2, Building2 } from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface TaskBoardProps {
  tasks: Task[];
  onDelete: (id: number) => void;
  onTaskClick: (task: Task) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onDelete, onTaskClick }) => {
  const [activeTab, setActiveTab] = useState<TaskStatus>(TaskStatus.IN_PROGRESS);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.status === activeTab);
  }, [tasks, activeTab]);

  const getPriorityStyles = (p: number) => {
    if (p >= 5) return 'text-rose-600 bg-rose-50 border-rose-100';
    if (p >= 4) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-indigo-600 bg-indigo-50 border-indigo-100';
  };

  return (
    <div className="space-y-6 pt-2">
      <div className="flex bg-slate-200/50 p-1 rounded-2xl gap-1">
        {[TaskStatus.NEW, TaskStatus.IN_PROGRESS, TaskStatus.DONE].map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`flex-1 py-2.5 text-[11px] font-extrabold uppercase tracking-tight rounded-xl transition-all duration-200 ${
              activeTab === status 
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <div 
              key={task.id} 
              onClick={() => onTaskClick(task)}
              className="group bg-white p-5 rounded-[28px] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(79,70,229,0.1)] transition-all duration-300 active:scale-[0.97] cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-indigo-100">
                    <Hash size={10} strokeWidth={3} /> {task.id}
                  </span>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${getPriorityStyles(task.priority)}`}>
                    P{task.priority}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                    className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-indigo-500 mb-2">
                <Building2 size={12} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-wider truncate max-w-[200px]">{task.organizationName}</span>
              </div>

              <h3 className="text-[17px] font-extrabold text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                {task.title}
              </h3>
              
              {task.solutionContext && (
                <p className="text-xs text-slate-400 line-clamp-1 font-medium mb-4 italic">
                  "{task.solutionContext}"
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100/50">
                  <Calendar size={13} className="text-indigo-500" />
                  <span className="text-[11px] font-bold">{task.deadline}</span>
                </div>
                
                {task.comments.length > 0 && (
                  <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {task.comments.length} комм.
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
              <Layers size={32} />
            </div>
            <p className="text-slate-400 font-bold text-sm">В этой категории пока пусто</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskBoard;
