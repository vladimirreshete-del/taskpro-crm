
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart as RechartsPieChart, Pie } from 'recharts';
import { Activity, BarChart3, TrendingUp, Target, Rocket } from 'lucide-react';
import { Task, Employee, TaskStatus } from '../types';

interface DashboardProps {
  tasks: Task[];
  employees: Employee[];
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, employees }) => {
  const weeklyData = [
    { name: 'Пн', value: 45 }, { name: 'Вт', value: 52 }, { name: 'Ср', value: 38 },
    { name: 'Чт', value: 65 }, { name: 'Пт', value: 48 }, { name: 'Сб', value: 20 }, { name: 'Вс', value: 15 },
  ];

  const statusCount = {
    done: tasks.filter(t => t.status === TaskStatus.DONE).length,
    inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    new: tasks.filter(t => t.status === TaskStatus.NEW).length,
  };

  const totalTasks = tasks.length;
  const pieData = [
    { name: 'Выполнено', value: statusCount.done || 1, color: '#6366f1' },
    { name: 'В работе', value: statusCount.inProgress || 1, color: '#f59e0b' },
    { name: 'Новые', value: statusCount.new || 1, color: '#e2e8f0' },
  ];

  const avgLoad = employees.length > 0 
    ? Math.round(employees.reduce((acc, curr) => acc + curr.loadPercentage, 0) / employees.length) 
    : 0;

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-600 p-5 rounded-[32px] shadow-xl text-white relative overflow-hidden group">
          <Activity className="absolute -right-4 -top-4 w-24 h-24 text-white/10 group-hover:rotate-12 transition-transform" />
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100 mb-1">Всего задач</p>
          <h3 className="text-4xl font-black">{totalTasks}</h3>
          <div className="mt-4 flex items-center gap-1.5 bg-white/20 w-fit px-2 py-1 rounded-lg text-[10px] font-bold">
            <TrendingUp size={10} /> Стабильно
          </div>
        </div>

        <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Нагрузка</p>
          <h3 className="text-4xl font-black text-slate-800">{avgLoad}%</h3>
          <p className="text-[10px] text-emerald-500 font-black mt-4 flex items-center gap-1">
            <Rocket size={10} /> В норме
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Активность</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Недельный отчет</p>
          </div>
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600 border border-slate-100">
            <BarChart3 size={20} />
          </div>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 700}} />
              <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={24}>
                {weeklyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 3 ? '#6366f1' : '#e2e8f0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <h3 className="text-lg font-black text-slate-800 tracking-tight mb-4">Статистика</h3>
        <div className="flex items-center gap-8">
          <div className="h-32 w-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie data={pieData} innerRadius={35} outerRadius={50} paddingAngle={8} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-3">
            {pieData.map(status => (
              <div key={status.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: status.color}}></div>
                  <span className="text-xs font-bold text-slate-500">{status.name}</span>
                </div>
                <span className="text-xs font-black text-slate-800">{status.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
