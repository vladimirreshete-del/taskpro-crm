
import React, { useState } from 'react';
import { X, Building2, Calendar, MessageCircle, Send, ShieldAlert, CheckCircle2, LayoutGrid, Trash2 } from 'lucide-react';
import { Task, TaskStatus, Employee, TaskComment } from '../types';

interface TaskDetailsProps {
  task: Task;
  currentUser: Employee;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (id: number) => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ task, currentUser, onClose, onUpdate, onDelete }) => {
  const [commentText, setCommentText] = useState('');

  const handleStatusChange = (newStatus: TaskStatus) => {
    onUpdate({ ...task, status: newStatus, updatedAt: new Date().toLocaleDateString('ru-RU') });
  };

  const addComment = () => {
    if (!commentText.trim()) return;
    const newComment: TaskComment = {
      id: Date.now(),
      authorName: currentUser.fullName,
      text: commentText,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };
    onUpdate({ ...task, comments: [...task.comments, newComment] });
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-lg z-[110] flex flex-col justify-end">
      <div className="bg-[#f8fafc] rounded-t-[48px] h-[92vh] w-full max-w-2xl mx-auto flex flex-col animate-fade-up shadow-2xl">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2 shrink-0"></div>

        {/* Header */}
        <div className="px-8 py-4 flex items-center justify-between border-b border-slate-100 bg-white/50 rounded-t-[48px]">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
            <X size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">#{task.id}</span>
            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full">P{task.priority}</span>
          </div>
          <button onClick={() => onDelete(task.id)} className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 border border-rose-100">
            <Trash2 size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar pb-32">
          {/* Main Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-500">
              <Building2 size={16} strokeWidth={3} />
              <span className="text-xs font-black uppercase tracking-widest">{task.organizationName}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight">{task.title}</h2>
            
            {task.solutionContext && (
              <div className="bg-indigo-50/50 p-5 rounded-[28px] border border-indigo-100/50">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                   <LayoutGrid size={12} /> Что нужно решить
                </p>
                <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{task.solutionContext}</p>
              </div>
            )}
          </div>

          {/* Status & Deadline Grid */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm space-y-3">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Текущий статус</span>
               <div className="flex flex-wrap gap-1.5">
                 {Object.values(TaskStatus).map(s => (
                   <button 
                    key={s} 
                    onClick={() => handleStatusChange(s)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all ${
                      task.status === s ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                   >
                     {s}
                   </button>
                 ))}
               </div>
             </div>
             <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm space-y-3 flex flex-col justify-center">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Срок выполнения</span>
               <div className="flex items-center gap-2 text-slate-800">
                 <Calendar size={16} className="text-rose-500" />
                 <span className="font-bold text-sm">{task.deadline}</span>
               </div>
             </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <MessageCircle size={20} className="text-indigo-500" /> Обсуждение
              </h3>
              <span className="text-xs font-bold text-slate-400">{task.comments.length} сообщений</span>
            </div>

            <div className="space-y-4">
              {task.comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 flex items-center justify-center text-[10px] font-black text-slate-500">
                    {comment.authorName[0]}
                  </div>
                  <div className="bg-white px-4 py-3 rounded-[20px] border border-slate-100 shadow-sm flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] font-extrabold text-indigo-500">{comment.authorName}</span>
                      <span className="text-[9px] font-bold text-slate-300">{comment.timestamp}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comment Input Footer */}
        <div className="p-6 bg-white border-t border-slate-100 rounded-b-[48px] absolute bottom-0 left-0 right-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3">
            <input 
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addComment()}
              placeholder="Оставьте комментарий..."
              className="flex-1 bg-slate-50 border border-slate-100 px-5 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/10 text-sm font-medium transition-all"
            />
            <button 
              onClick={addComment}
              disabled={!commentText.trim()}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                commentText.trim() ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 active:scale-90' : 'bg-slate-100 text-slate-300'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
