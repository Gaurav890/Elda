'use client';

import { useState, useEffect } from 'react';
import { ActivityLog, ActivityType } from '@/types/activity';
import { formatDistanceToNow } from 'date-fns';
import {
  Activity,
  MessageCircle,
  CheckCircle,
  XCircle,
  Smartphone,
  MapPin,
  AlertTriangle,
  Bell,
  Circle,
} from 'lucide-react';
import { cn, formatToPST } from '@/lib/utils';

interface TimelineItemProps {
  activity: ActivityLog;
  isLast?: boolean;
}

const activityIcons: Record<ActivityType, { icon: any; color: string; bgColor: string }> = {
  heartbeat: {
    icon: Activity,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  conversation: {
    icon: MessageCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  reminder_response: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  reminder_sent: {
    icon: Bell,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  app_open: {
    icon: Smartphone,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  app_close: {
    icon: Smartphone,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
  location_update: {
    icon: MapPin,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  emergency: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  schedule_completed: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  schedule_missed: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  other: {
    icon: Circle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
};

export function TimelineItem({ activity, isLast = false }: TimelineItemProps) {
  const { icon: Icon, color, bgColor } = activityIcons[activity.activity_type];

  // Fix hydration issue: Calculate time on client only
  const [formattedTime, setFormattedTime] = useState('Recently');
  const [pstTime, setPstTime] = useState('');

  useEffect(() => {
    try {
      setFormattedTime(formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }));
      setPstTime(formatToPST(activity.timestamp, "h:mm a"));
    } catch {
      setFormattedTime('Recently');
      setPstTime('');
    }
  }, [activity.timestamp]);

  return (
    <div className="relative flex gap-4 pb-6">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-5 top-11 bottom-0 w-0.5 bg-gray-200" />
      )}

      {/* Icon */}
      <div className={cn('relative z-10 flex h-10 w-10 items-center justify-center rounded-full', bgColor)}>
        <Icon className={cn('h-5 w-5', color)} />
      </div>

      {/* Content */}
      <div className="flex-1 pt-1">
        <div className="flex items-start justify-between mb-1">
          <h4 className="text-sm font-semibold text-gray-900">{activity.title}</h4>
          <div className="flex flex-col items-end ml-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formattedTime}
            </span>
            {pstTime && (
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {pstTime} PST
              </span>
            )}
          </div>
        </div>
        {activity.description && (
          <p className="text-sm text-muted-foreground">{activity.description}</p>
        )}

        {/* Reminder-specific metadata */}
        {(activity.activity_type === 'reminder_sent' ||
          activity.activity_type === 'reminder_response' ||
          activity.activity_type === 'schedule_completed' ||
          activity.activity_type === 'schedule_missed') && activity.metadata && (
          <div className="mt-2 space-y-1">
            {/* Reminder status */}
            {activity.metadata.status && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700">Status:</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  activity.metadata.status === 'completed' && "bg-green-100 text-green-700",
                  activity.metadata.status === 'missed' && "bg-red-100 text-red-700",
                  activity.metadata.status === 'pending' && "bg-yellow-100 text-yellow-700",
                  activity.metadata.status === 'snoozed' && "bg-blue-100 text-blue-700"
                )}>
                  {activity.metadata.status}
                </span>
              </div>
            )}

            {/* Retry count */}
            {activity.metadata.retry_count > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700">Retries:</span>
                <span className="text-xs text-orange-600 font-medium">
                  {activity.metadata.retry_count} attempt{activity.metadata.retry_count > 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Acknowledgment time */}
            {activity.metadata.completed_at && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700">Completed:</span>
                <span className="text-xs text-gray-600">
                  {formatToPST(activity.metadata.completed_at, "h:mm a")}
                </span>
              </div>
            )}

            {/* Patient response */}
            {activity.metadata.patient_response && (
              <div className="mt-1">
                <span className="text-xs font-medium text-gray-700">Patient said: </span>
                <span className="text-xs text-gray-600 italic">
                  "{activity.metadata.patient_response}"
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
