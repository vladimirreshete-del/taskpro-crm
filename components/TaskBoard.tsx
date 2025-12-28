import React, { useState, useMemo } from 'react';
import { Calendar, Clock, ChevronRight, Hash, Layers } from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface TaskBoardProps {
  tasks: Task[];
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks }) => {
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
      {/* Tabs */}
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

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <div 
              key={task.id} 
              className="group bg-white p-5 rounded-[28px] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(79,70,229,0.1)] transition-all duration-300 active:scale-[0.97]"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-indigo-100">
                    <Hash size={10} strokeWidth={3} /> {task.id}
                  </span>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${getPriorityStyles(task.priority)}`}>
                    P{task.priority}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <ChevronRight size={18} />
                </div>
              </div>

              <h3 className="text-[17px] font-extrabold text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                {task.title}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2 font-medium mb-5 leading-relaxed">
                {task.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">AO</div>
                  <div className="w-8 h-8 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">IV</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100/50">
                    <Calendar size={13} className="text-indigo-500" />
                    <span className="text-[11px] font-bold">{task.deadline}</span>
                  </div>
                  {task.weightHours > 0 && (
                    <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100/50">
                      <Clock size={13} className="text-amber-500" />
                      <span className="text-[11px] font-bold">{task.weightHours}ч</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
              <Layers size={32} />
            </div>
            <div>
              <p className="text-slate-800 font-bold">Задач не найдено</p>
              <p className="text-slate-400 text-xs font-medium">В этой категории пока пусто</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskBoard;