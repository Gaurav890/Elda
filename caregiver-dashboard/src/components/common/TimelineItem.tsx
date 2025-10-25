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
import { cn } from '@/lib/utils';

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

  useEffect(() => {
    try {
      setFormattedTime(formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }));
    } catch {
      setFormattedTime('Recently');
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
          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
            {formattedTime}
          </span>
        </div>
        {activity.description && (
          <p className="text-sm text-muted-foreground">{activity.description}</p>
        )}
      </div>
    </div>
  );
}
