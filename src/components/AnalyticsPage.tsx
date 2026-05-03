import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ArrowLeft, TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { UserStats } from '../types';

interface AnalyticsPageProps {
  stats: UserStats;
  onBack: () => void;
}

export function AnalyticsPage({ stats, onBack }: AnalyticsPageProps) {
  const COLORS = ['#55cdd1', '#14b8a6', '#0d9488', '#0f766e', '#134e4a'];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center hover:bg-brand-accent hover:text-brand-bg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Analytics & Insights</h1>
          <p className="text-brand-text-muted">Detailed breakdown of your commerce data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scans Over Time */}
        <div className="glass-card p-6 min-h-[400px] flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="w-5 h-5 text-brand-accent" />
            <h2 className="text-xl font-bold">Activity Trend</h2>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.scansByDate}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#55cdd1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#55cdd1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#666" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#666" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#212121', 
                    border: '1px solid #2B2B2B',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#55cdd1' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#55cdd1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="glass-card p-6 min-h-[400px] flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <PieChartIcon className="w-5 h-5 text-brand-accent" />
            <h2 className="text-xl font-bold">Category Mix</h2>
          </div>
          <div className="flex-1 w-full min-h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="name"
                >
                  {stats.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ 
                    backgroundColor: '#212121', 
                    border: '1px solid #2B2B2B',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
             {stats.categories.map((cat, i) => (
               <div key={cat.name} className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                 <span className="text-xs font-bold">{cat.name}</span>
                 <span className="text-[10px] text-brand-text-muted ml-auto">{cat.count} items</span>
               </div>
             ))}
          </div>
        </div>

        {/* Market Value by Category */}
        <div className="glass-card p-6 min-h-[400px] lg:col-span-2 flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <BarChart3 className="w-5 h-5 text-brand-accent" />
            <h2 className="text-xl font-bold">Estimated Market Value by Category</h2>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categories}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#666" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#666" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                   contentStyle={{ 
                    backgroundColor: '#212121', 
                    border: '1px solid #2B2B2B',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#55cdd1" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
