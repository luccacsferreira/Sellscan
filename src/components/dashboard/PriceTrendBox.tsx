import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';

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
  scanId: string;
  productName: string;
}

// Seeded simple pseudo-random generator to make trends deterministic for a given product
function createSeededRandom(seedStr: string) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = (h << 5) - h + seedStr.charCodeAt(i);
    h |= 0;
  }
  return function() {
    let t = h += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function PriceTrendBox({ history, currencySymbol, scanId, productName }: PriceTrendBoxProps) {
  const [activeTimeframe, setActiveTimeframe] = useState<string>('today');

  const getProductAgeYears = () => {
    // Look for a 4-digit number that represents a model release year in the name (e.g. 2018, 1999)
    const yearMatches = productName.match(/\b(19\d\d|20[0-2]\d)\b/);
    if (yearMatches) {
      const year = parseInt(yearMatches[0], 10);
      const currentYear = new Date().getFullYear();
      const age = currentYear - year;
      if (age > 0) return Math.min(30, age);
    }
    
    // Fallback to deterministic age based on a hash of the scan ID + name
    const hashString = scanId + productName;
    let hash = 0;
    for (let i = 0; i < hashString.length; i++) {
      hash = (hash << 5) - hash + hashString.charCodeAt(i);
      hash |= 0;
    }
    // Deterministic age between 2 and 15 years
    const age = (Math.abs(hash) % 14) + 2; 
    return age;
  };

  const productAge = getProductAgeYears();

  const timeframes = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
    ...(productAge >= 5 ? [{ id: '5years', label: 'Last 5 Years' }] : []),
    ...(productAge >= 10 ? [{ id: '10years', label: 'Last 10 Years' }] : []),
    { id: 'lifetime', label: `Lifetime (${productAge}y)` }
  ];

  const basePrice = useMemo(() => {
    if (history.data && history.data.length > 0) {
      return history.data[history.data.length - 1].price;
    }
    return 100;
  }, [history.data]);

  const chartData = useMemo(() => {
    const isCollectible = /antique|vintage|retro|rare|collectible|lego|jordan|pokemon/i.test(productName);
    const rng = createSeededRandom(scanId + activeTimeframe);
    
    const points: { date: string; price: number }[] = [];
    const currentYear = new Date().getFullYear();
    const currentDate = new Date();
    
    switch (activeTimeframe) {
      case 'today': {
        const hours = [0, 3, 6, 9, 12, 15, 18, 21, 24];
        hours.forEach((h, index) => {
          const hourStr = h === 12 ? '12 PM' : h === 24 ? '12 AM' : h > 12 ? `${h - 12} PM` : `${h} AM`;
          const changePercent = (rng() - 0.5) * 0.024;
          const fluctuation = Math.sin(index * 1.5) * 0.005;
          const price = basePrice * (1 + changePercent + fluctuation);
          points.push({
            date: hourStr,
            price: Number(price.toFixed(2))
          });
        });
        break;
      }
      case 'week': {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(currentDate);
          d.setDate(currentDate.getDate() - i);
          const dayName = days[d.getDay()];
          const changePercent = (rng() - 0.5) * 0.04;
          const trend = Math.sin((6 - i) * 0.8) * 0.01;
          const price = basePrice * (1 + changePercent + trend);
          points.push({
            date: dayName,
            price: Number(price.toFixed(2))
          });
        }
        break;
      }
      case 'month': {
        if (history.data && history.data.length > 0) {
          return history.data;
        }
        for (let i = 29; i >= 0; i--) {
          const d = new Date(currentDate);
          d.setDate(currentDate.getDate() - i);
          const m = d.toLocaleString('en-US', { month: 'short' });
          const dayNum = String(d.getDate()).padStart(2, '0');
          const changePercent = (rng() - 0.5) * 0.08;
          const cycle = Math.sin((29 - i) * 0.4) * 0.02;
          const price = basePrice * (1 + changePercent + cycle);
          points.push({
            date: `${m} ${dayNum}`,
            price: Number(price.toFixed(2))
          });
        }
        break;
      }
      case 'year': {
        for (let i = 11; i >= 0; i--) {
          const d = new Date(currentDate);
          d.setMonth(currentDate.getMonth() - i);
          const m = d.toLocaleString('en-US', { month: 'short' });
          const yearShort = String(d.getFullYear()).slice(-2);
          
          const timeRatio = (11 - i) / 11;
          const trendEffect = isCollectible ? (0.12 * timeRatio) : (-0.08 * timeRatio);
          const volatility = (rng() - 0.5) * 0.12; 
          const seasonal = Math.sin(timeRatio * Math.PI * 4) * 0.03;

          const price = basePrice * (1 - trendEffect) * (1 + volatility + seasonal);
          points.push({
            date: `${m} '${yearShort}`,
            price: Number(price.toFixed(2))
          });
        }
        break;
      }
      case '5years': {
        for (let i = 4; i >= 0; i--) {
          const yr = currentYear - i;
          const timeRatio = (4 - i) / 4;
          
          const totalTrend = isCollectible ? (0.45 * timeRatio) : (-0.35 * timeRatio);
          const randomNoise = (rng() - 0.5) * 0.08;

          const price = basePrice * (1 - totalTrend) * (1 + randomNoise);
          points.push({
            date: String(yr),
            price: Number(price.toFixed(2))
          });
        }
        break;
      }
      case '10years': {
        for (let i = 9; i >= 0; i--) {
          const yr = currentYear - i;
          const timeRatio = (9 - i) / 9;

          const totalTrend = isCollectible ? (1.2 * timeRatio) : (-0.6 * timeRatio);
          const randomNoise = (rng() - 0.5) * 0.1;

          const price = basePrice * (1 - totalTrend) * (1 + randomNoise);
          points.push({
            date: String(yr),
            price: Number(price.toFixed(2))
          });
        }
        break;
      }
      case 'lifetime': {
        const yearsCount = productAge;
        for (let i = yearsCount; i >= 0; i--) {
          const yr = currentYear - i;
          const timeRatio = (yearsCount - i) / yearsCount;

          const totalTrend = isCollectible ? (0.15 * yearsCount * timeRatio) : (-0.08 * yearsCount * timeRatio);
          const randomNoise = (rng() - 0.5) * 0.12;

          const price = basePrice * (1 - totalTrend) * (1 + randomNoise);
          points.push({
            date: String(yr),
            price: Number(price.toFixed(2))
          });
        }
        break;
      }
    }

    return points;
  }, [activeTimeframe, scanId, productName, basePrice, history.data, productAge]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="glass-card p-6 border-brand-border/10 min-h-[420px] h-[440px] flex flex-col relative overflow-hidden"
    >
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-extrabold uppercase text-brand-text-muted tracking-[0.2em] opacity-60 mb-1">Historical Value Track</h3>
            <p className="text-xs text-brand-text-muted font-medium">
              Product price trend analyzer
            </p>
          </div>
          <div className={cn(
            "flex items-center gap-2 font-bold text-xs px-3 py-1 rounded-full border",
            history.isLive 
              ? "text-green-500 bg-green-500/10 border-green-500/20" 
              : "text-brand-text-muted bg-brand-border/15 border-brand-border/30"
          )}>
            <TrendingUp className="w-3 h-3" /> {history.isLive ? 'Live Market' : 'Inactive Market'}
          </div>
        </div>

        {/* Timeframe selector button row */}
        <div className="flex flex-wrap gap-1 p-0.5 bg-brand-border/5 rounded-xl border border-brand-border/10 w-fit max-w-full overflow-x-auto scrollbar-none">
          {timeframes.map((tf) => {
            const isActive = activeTimeframe === tf.id;
            return (
              <button
                key={tf.id}
                onClick={() => setActiveTimeframe(tf.id)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                  isActive
                    ? "bg-brand-accent text-brand-bg font-black shadow-md shadow-brand-accent/5"
                    : "text-brand-text-muted hover:text-brand-text hover:bg-white/5"
                )}
              >
                {tf.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grow w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-brand-accent)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-brand-accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.15)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(128,128,128,0.6)', fontSize: 10, fontWeight: 'bold' }}
                dy={10}
                minTickGap={30}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(128,128,128,0.6)', fontSize: 10, fontWeight: 'bold' }}
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
                animationDuration={1000}
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
