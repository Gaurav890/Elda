'use client';

import { Patient } from '@/types/patient';
import { KPICard } from '@/components/common/KPICard';
import { TimelineItem } from '@/components/common/TimelineItem';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  MessageCircle,
  Heart,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  usePatientActivity,
  useTodayReminderSummary,
  usePatientInsights,
  usePatientMood,
  useWeeklyAdherence,
} from '@/hooks/useActivity';
import { MoodSentiment } from '@/types/activity';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface PatientOverviewTabProps {
  patient: Patient;
}

const moodEmojis: Record<MoodSentiment, string> = {
  positive: '😊',
  neutral: '😐',
  negative: '😔',
};

const moodLabels: Record<MoodSentiment, string> = {
  positive: 'Positive',
  neutral: 'Neutral',
  negative: 'Negative',
};

export function PatientOverviewTab({ patient }: PatientOverviewTabProps) {
  // Fetch all data
  const { data: activityData, isLoading: activityLoading } = usePatientActivity(patient.id, 20);
  const { data: reminderData, isLoading: reminderLoading } = useTodayReminderSummary(patient.id);
  const { data: insightsData, isLoading: insightsLoading } = usePatientInsights(patient.id, 3);
  const { data: moodData, isLoading: moodLoading } = usePatientMood(patient.id);
  const { data: adherenceData, isLoading: adherenceLoading } = useWeeklyAdherence(patient.id);

  // Calculate KPI values
  const todayRemindersValue = reminderData
    ? `${reminderData.summary.completed}/${reminderData.summary.total}`
    : '0/0';
  const todayRemindersRate = reminderData?.summary.completion_rate || 0;
  const todayRemindersVariant =
    todayRemindersRate >= 80 ? 'success' : todayRemindersRate >= 60 ? 'warning' : 'danger';

  const lastInteractionValue = patient.last_active_at
    ? formatDistanceToNow(new Date(patient.last_active_at), { addSuffix: true })
    : 'No activity';

  const moodValue = moodData ? moodEmojis[moodData.sentiment] : '😐';
  const moodLabel = moodData ? moodLabels[moodData.sentiment] : 'Unknown';

  const weeklyAdherenceValue = adherenceData ? `${Math.round(adherenceData.rate)}%` : '0%';
  const weeklyAdherenceLabel = adherenceData
    ? `${adherenceData.completed}/${adherenceData.total} reminders`
    : '0/0 reminders';
  const adherenceVariant =
    adherenceData && adherenceData.rate >= 80
      ? 'success'
      : adherenceData && adherenceData.rate >= 60
      ? 'warning'
      : 'danger';

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reminderLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <KPICard
            title="Today's Reminders"
            value={todayRemindersValue}
            label="Completed today"
            icon={CheckCircle}
            variant={todayRemindersVariant}
          />
        )}

        <KPICard
          title="Last Interaction"
          value={lastInteractionValue}
          label="Last conversation"
          icon={MessageCircle}
          variant="default"
        />

        {moodLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <KPICard
            title="Current Mood"
            value={moodValue}
            label={moodLabel}
            icon={Heart}
            variant={moodData?.sentiment === 'positive' ? 'success' : 'default'}
          />
        )}

        {adherenceLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <KPICard
            title="Weekly Adherence"
            value={weeklyAdherenceValue}
            label={weeklyAdherenceLabel}
            icon={TrendingUp}
            variant={adherenceVariant}
          />
        )}
      </div>

      {/* Main Content: Activity Timeline + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline (Left - 2 columns) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activityData && activityData.activities.length > 0 ? (
                <div>
                  {activityData.activities.map((activity, index) => (
                    <TimelineItem
                      key={activity.id}
                      activity={activity}
                      isLast={index === activityData.activities.length - 1}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    No activity yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Activity will appear here once {patient.first_name} starts using the app.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Insights (Right - 1 column) */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  AI Insights
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {insightsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))}
                </div>
              ) : insightsData && insightsData.insights.length > 0 ? (
                <div className="space-y-4">
                  {insightsData.insights.map((insight) => (
                    <div
                      key={insight.id}
                      className="p-4 rounded-lg border bg-purple-50/50 border-purple-100"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(insight.confidence_score)}% confidence
                        </Badge>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {insight.description}
                      </p>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full gap-2">
                    View all insights
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    No insights yet
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    AI insights will appear here as we learn more about {patient.first_name}.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
