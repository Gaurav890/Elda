'use client';

import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { MedicationAdherenceData } from '@/types/report';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MedicationAdherenceChartProps {
  data: MedicationAdherenceData[];
  trend?: 'up' | 'down' | 'stable';
  average?: number;
}

export function MedicationAdherenceChart({
  data,
  trend = 'stable',
  average = 0,
}: MedicationAdherenceChartProps) {
  // Format data for chart (show only last 14 days for better visibility)
  const chartData = data.slice(-14).map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    adherence: item.adherence,
  }));

  const trendConfig = {
    up: { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100', text: 'Improving' },
    down: { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100', text: 'Declining' },
    stable: { icon: Minus, color: 'text-gray-600', bg: 'bg-gray-100', text: 'Stable' },
  };

  const config = trendConfig[trend];
  const TrendIcon = config.icon;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Medication Adherence</h3>
          <p className="text-sm text-gray-500 mt-1">Daily medication compliance over time</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{average}%</div>
          <div className={`flex items-center gap-1 text-sm ${config.color} mt-1`}>
            <TrendIcon className="w-4 h-4" />
            <span>{config.text}</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
            formatter={(value: number) => [`${value}%`, 'Adherence']}
          />
          <Line
            type="monotone"
            dataKey="adherence"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Last 14 days</span>
          <span className="text-gray-500">Target: 90%+</span>
        </div>
      </div>
    </Card>
  );
}
