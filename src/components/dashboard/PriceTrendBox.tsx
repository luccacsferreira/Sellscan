import React from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface PricePoint {
  date: string;
  price: number;
}

interface PriceTrendBoxProps {
  history: {
    data: PricePoint[];
    isLive: boolean;
    limitedHistory: boolean;
  };
  currencySymbol: string;
}

export function PriceTrendBox({ history, currencySymbol }: PriceTrendBoxProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="glass-card p-6 border-brand-border/10 h-[400px] flex flex-col relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-[10px] font-extrabold uppercase text-brand-text-muted tracking-[0.2em] opacity-60 mb-1">Historical Value Track</h3>
          <p className="text-xs text-brand-text-muted font-medium">
            {history.limitedHistory ? 'Post-launch value index (Limited)' : '30-day market index'}
          </p>
        </div>
        <div className={cn(
          "flex items-center gap-2 font-bold text-xs px-3 py-1 rounded-full border",
          history.isLive 
            ? "text-green-500 bg-green-500/10 border-green-500/20" 
            : "text-brand-text-muted bg-white/5 border-white/10"
        )}>
          <TrendingUp className="w-3 h-3" /> {history.isLive ? 'Live Market' : 'Inactive Market'}
        </div>
      </div>

      <div className="grow w-full">
        {history.data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history.data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-brand-accent)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-brand-accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold' }}
                dy={10}
                minTickGap={30}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold' }}
                domain={['auto', 'auto']}
                tickFormatter={(val) => `${currencySymbol}${val}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 15, 15, 0.9)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                formatter={(value: any) => [`${currencySymbol}${value}`, 'Market Price']}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="var(--color-brand-accent)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-10">
            <TrendingUp className="w-10 h-10 text-brand-text-muted opacity-20 mb-4" />
            <p className="text-sm font-bold text-brand-text-muted italic">Limited price history available — item is too recent for a full trend analysis</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
