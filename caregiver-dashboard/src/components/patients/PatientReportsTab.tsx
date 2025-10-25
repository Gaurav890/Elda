'use client';

import { useState } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import { usePatientReports } from '@/hooks/useReports';
import { MedicationAdherenceChart } from '@/components/reports/MedicationAdherenceChart';
import { ActivityTrendsChart } from '@/components/reports/ActivityTrendsChart';
import { MoodAnalyticsChart } from '@/components/reports/MoodAnalyticsChart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import type { TimeRange } from '@/types/report';

interface PatientReportsTabProps {
  patientId: string;
}

export function PatientReportsTab({ patientId }: PatientReportsTabProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const { data: reports, isLoading, error } = usePatientReports(patientId, timeRange);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-80 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm">Failed to load reports</p>
        </div>
      </div>
    );
  }

  if (!reports) {
    return null;
  }

  const timeRangeLabels: Record<TimeRange, string> = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    all: 'All Time',
  };

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Health Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">
            Trends and insights based on patient data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(timeRangeLabels) as TimeRange[]).map((range) => (
                <SelectItem key={range} value={range}>
                  {timeRangeLabels[range]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Medication Adherence</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.summary.medication_adherence.average}%
              </p>
            </div>
            <div
              className={`p-2 rounded-lg ${
                reports.summary.medication_adherence.trend === 'up'
                  ? 'bg-green-100'
                  : reports.summary.medication_adherence.trend === 'down'
                  ? 'bg-red-100'
                  : 'bg-gray-100'
              }`}
            >
              <TrendingUp
                className={`w-5 h-5 ${
                  reports.summary.medication_adherence.trend === 'up'
                    ? 'text-green-600'
                    : reports.summary.medication_adherence.trend === 'down'
                    ? 'text-red-600 rotate-180'
                    : 'text-gray-600'
                }`}
              />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Daily Activity</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.summary.activity_level.average_minutes} min
              </p>
            </div>
            <div
              className={`p-2 rounded-lg ${
                reports.summary.activity_level.trend === 'up'
                  ? 'bg-green-100'
                  : reports.summary.activity_level.trend === 'down'
                  ? 'bg-orange-100'
                  : 'bg-gray-100'
              }`}
            >
              <TrendingUp
                className={`w-5 h-5 ${
                  reports.summary.activity_level.trend === 'up'
                    ? 'text-green-600'
                    : reports.summary.activity_level.trend === 'down'
                    ? 'text-orange-600 rotate-180'
                    : 'text-gray-600'
                }`}
              />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Mood</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.summary.mood.average_score}/10
              </p>
            </div>
            <div
              className={`p-2 rounded-lg ${
                reports.summary.mood.trend === 'up'
                  ? 'bg-green-100'
                  : reports.summary.mood.trend === 'down'
                  ? 'bg-red-100'
                  : 'bg-gray-100'
              }`}
            >
              <TrendingUp
                className={`w-5 h-5 ${
                  reports.summary.mood.trend === 'up'
                    ? 'text-green-600'
                    : reports.summary.mood.trend === 'down'
                    ? 'text-red-600 rotate-180'
                    : 'text-gray-600'
                }`}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Medication Adherence Chart */}
      <MedicationAdherenceChart
        data={reports.medication_adherence}
        trend={reports.summary.medication_adherence.trend}
        average={reports.summary.medication_adherence.average}
      />

      {/* Activity and Mood Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityTrendsChart
          data={reports.activity}
          trend={reports.summary.activity_level.trend}
          average={reports.summary.activity_level.average_minutes}
        />
        <MoodAnalyticsChart
          data={reports.mood}
          trend={reports.summary.mood.trend}
          average={reports.summary.mood.average_score}
        />
      </div>
    </div>
  );
}
