import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Check } from 'lucide-react';
import { cn, formatAmount } from '../../lib/utils';

interface PricePoint {
  date: string;
  price: number;
}

interface PriceTrendBoxProps {
  history: {
    month: PricePoint[];
    year: PricePoint[];
    allTime: PricePoint[];
    isLive: boolean;
    limitedHistory: boolean;
  };
  currencySymbol: string;
  scanId: string;
  productName: string;
}

export function PriceTrendBox({ history, currencySymbol }: PriceTrendBoxProps) {
  const [activeTimeframe, setActiveTimeframe] = useState<'month' | 'year' | 'allTime'>('month');
  const [isFollowing, setIsFollowing] = useState(true);

  const timeframes = [
    { id: 'month', label: '1M' },
    { id: 'year', label: '1Y' },
    { id: 'allTime', label: 'Max' }
  ] as const;

  const chartData = useMemo(() => {
    const raw = activeTimeframe === 'month' ? history.month : activeTimeframe === 'year' ? history.year : history.allTime;
    return (raw || []).map(p => ({ ...p, price: Math.max(0.01, p.price) })); // Ensure no zero/negative
  }, [activeTimeframe, history]);

  const currentPrice = chartData[chartData.length - 1]?.price || 0;
  const firstPrice = chartData[0]?.price || 1;
  const diff = currentPrice - firstPrice;
  const percentChange = ((diff / firstPrice) * 100);
  const isPositive = diff >= 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="glass-card p-6 border-brand-border/10 min-h-[460px] flex flex-col relative overflow-hidden bg-gradient-to-b from-brand-bg to-brand-card"
    >
      {/* Market Header */}
      <div className="flex flex-col gap-1 mb-8">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
             <div className="flex items-center gap-3">
               <h2 className="text-5xl font-black tracking-tighter text-brand-text tabular-nums">
                 {formatAmount(currentPrice)}
               </h2>
               <span className="text-xl font-bold text-brand-text-muted mt-2">{currencySymbol}</span>
               
               <div className={cn(
                 "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs ml-2 mt-1",
                 isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
               )}>
                 {isPositive ? '↑' : '↓'} {Math.abs(percentChange).toFixed(2)}%
                 <span className="opacity-60 font-medium lowercase ml-1">past {activeTimeframe === 'month' ? 'month' : activeTimeframe === 'year' ? 'year' : 'timeline'}</span>
               </div>
             </div>
             <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-[0.2em] opacity-40">
               Market Price Tracker • {new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
             </p>
          </div>

          <button 
            onClick={() => setIsFollowing(!isFollowing)}
            className={cn(
              "px-6 py-2.5 rounded-full border text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              isFollowing 
                ? "bg-white/5 border-white/20 text-white" 
                : "bg-brand-accent text-brand-bg border-brand-accent shadow-lg shadow-brand-accent/20"
            )}
          >
            {isFollowing ? <><Check className="w-3.5 h-3.5" /> Following</> : 'Market Watch'}
          </button>
        </div>
      </div>

      {/* Grid Pattern Background */}
      <div className="absolute inset-x-0 top-[180px] bottom-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* Timeframe selector button row */}
      <div className="flex items-center gap-2 mb-6 z-10">
        <div className="flex gap-1 p-1 bg-brand-bg/80 border border-brand-border/30 rounded-xl">
          {timeframes.map((tf) => {
            const isActive = activeTimeframe === tf.id;
            return (
              <button
                key={tf.id}
                onClick={() => setActiveTimeframe(tf.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  isActive
                    ? "bg-brand-accent text-brand-bg"
                    : "text-brand-text-muted hover:text-brand-text hover:bg-white/5"
                )}
              >
                {tf.label}
              </button>
            );
          })}
        </div>
        <div className="h-4 w-[1px] bg-brand-border mx-2" />
        <div className="flex items-center gap-2 text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">
           <div className={cn("w-2 h-2 rounded-full", history.isLive ? "bg-green-500 animate-pulse" : "bg-neutral-600")} />
           {history.isLive ? 'Live Stream' : 'Offline'}
        </div>
      </div>

      <div className="grow w-full h-[240px] z-10">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(128,128,128,0.5)', fontSize: 9, fontWeight: 'bold' }}
                dy={10}
                minTickGap={40}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(128,128,128,0.5)', fontSize: 9, fontWeight: 'bold' }}
                domain={['auto', 'auto']}
                orientation="right"
                tickFormatter={(val) => `${formatAmount(val)}`}
              />
              <Tooltip 
                cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(20px)',
                  padding: '12px'
                }}
                itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: '900' }}
                labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}
                formatter={(value: any) => [`${currencySymbol}${formatAmount(value)}`, 'Valuation']}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={isPositive ? "#10b981" : "#ef4444"} 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-10 bg-brand-bg/20 rounded-3xl border border-dashed border-brand-border/30">
            <TrendingUp className="w-10 h-10 text-brand-text-muted opacity-20 mb-4" />
            <p className="text-xs font-bold text-brand-text-muted uppercase tracking-widest opacity-40">Insufficent Market Data</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
