
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart as RechartsPieChart, Pie } from 'recharts';
// Added BarChart3 to lucide-react imports
import { Target, Zap, Rocket, Activity, BarChart3 } from 'lucide-react';

const DATA_WEEKLY = [
  { name: 'Пн', value: 45 },
  { name: 'Вт', value: 52 },
  { name: 'Ср', value: 38 },
  { name: 'Чт', value: 65 },
  { name: 'Пт', value: 48 },
  { name: 'Сб', value: 20 },
  { name: 'Вс', value: 15 },
];

const DATA_STATUS = [
  { name: 'В срок', value: 75, color: '#6366f1' },
  { name: 'Задержка', value: 15, color: '#f59e0b' },
  { name: 'Алярм', value: 10, color: '#f43f5e' },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-600 p-5 rounded-[32px] shadow-xl shadow-indigo-600/20 text-white relative overflow-hidden">
          <Activity className="absolute -right-4 -top-4 w-24 h-24 text-white/10" />
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100 mb-1">Всего задач</p>
          <h3 className="text-3xl font-black">284</h3>
          <div className="mt-4 flex items-center gap-1.5 bg-white/20 w-fit px-2 py-1 rounded-lg text-[10px] font-bold">
            <Zap size={10} fill="currentColor" /> +24 сегодня
          </div>
        </div>

        <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
          <Target className="absolute -right-4 -top-4 w-24 h-24 text-slate-50" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 text-right">Ваш KPI</p>
          <h3 className="text-3xl font-black text-slate-800 text-right">98%</h3>
          <p className="text-[10px] text-emerald-500 font-black text-right mt-4 flex items-center justify-end gap-1">
            <Rocket size={10} /> Лучший в отделе
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-slate-800 tracking-tight">Активность недели</h3>
          <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
            <BarChart3 size={16} />
          </div>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DATA_WEEKLY}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 700}} />
              <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={24}>
                {DATA_WEEKLY.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 3 ? '#6366f1' : '#e2e8f0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <h3 className="text-lg font-black text-slate-800 tracking-tight mb-4">Здоровье проектов</h3>
        <div className="flex items-center gap-8">
          <div className="h-32 w-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={DATA_STATUS}
                  innerRadius={35}
                  outerRadius={50}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {DATA_STATUS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-3">
            {DATA_STATUS.map(status => (
              <div key={status.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{backgroundColor: status.color}}></div>
                  <span className="text-xs font-bold text-slate-500">{status.name}</span>
                </div>
                <span className="text-xs font-black text-slate-800">{status.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
