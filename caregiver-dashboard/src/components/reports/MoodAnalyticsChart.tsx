'use client';

import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { MoodData } from '@/types/report';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MoodAnalyticsChartProps {
  data: MoodData[];
  trend?: 'up' | 'down' | 'stable';
  average?: number;
}

export function MoodAnalyticsChart({
  data,
  trend = 'stable',
  average = 0,
}: MoodAnalyticsChartProps) {
  // Format data for chart (show only last 14 days)
  const chartData = data.slice(-14).map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: item.score,
    sentiment: item.sentiment,
  }));

  const trendConfig = {
    up: { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100', text: 'Improving' },
    down: { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100', text: 'Declining' },
    stable: { icon: Minus, color: 'text-gray-600', bg: 'bg-gray-100', text: 'Stable' },
  };

  const config = trendConfig[trend];
  const TrendIcon = config.icon;

  // Calculate sentiment distribution
  const positiveCount = data.filter((d) => d.sentiment === 'positive').length;
  const neutralCount = data.filter((d) => d.sentiment === 'neutral').length;
  const negativeCount = data.filter((d) => d.sentiment === 'negative').length;
  const total = data.length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Mood Analytics</h3>
          <p className="text-sm text-gray-500 mt-1">Emotional well-being score (1-10)</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{average}</div>
          <div className={`flex items-center gap-1 text-sm ${config.color} mt-1`}>
            <TrendIcon className="w-4 h-4" />
            <span>{config.text}</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
            formatter={(value: number) => [value, 'Mood Score']}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#colorScore)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-600 mb-1">Positive</div>
            <div className="text-lg font-semibold text-green-600">
              {Math.round((positiveCount / total) * 100)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 mb-1">Neutral</div>
            <div className="text-lg font-semibold text-gray-600">
              {Math.round((neutralCount / total) * 100)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 mb-1">Negative</div>
            <div className="text-lg font-semibold text-red-600">
              {Math.round((negativeCount / total) * 100)}%
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
