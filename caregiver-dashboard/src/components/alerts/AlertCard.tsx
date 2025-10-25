'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertCircle,
  Pill,
  Activity,
  Heart,
  Shield,
  Smile,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SeverityBadge } from './SeverityBadge';
import type { Alert, AlertType, AlertSeverity, AlertStatus } from '@/types/alert';

interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: (alertId: string) => void;
  isAcknowledging?: boolean;
  showPatientName?: boolean;
  patientName?: string;
  patientId?: string;
}

const alertTypeConfig: Record<
  AlertType,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  medication: { icon: Pill, color: 'text-purple-600' },
  health: { icon: Heart, color: 'text-red-600' },
  activity: { icon: Activity, color: 'text-green-600' },
  safety: { icon: Shield, color: 'text-orange-600' },
  mood: { icon: Smile, color: 'text-blue-600' },
  other: { icon: AlertCircle, color: 'text-gray-600' },
};

const severityBorderConfig: Record<AlertSeverity, string> = {
  low: 'border-l-blue-500',
  medium: 'border-l-yellow-500',
  high: 'border-l-orange-500',
  critical: 'border-l-red-500',
};

export function AlertCard({
  alert,
  onAcknowledge,
  isAcknowledging,
  showPatientName,
  patientName,
}: AlertCardProps) {
  const [relativeTime, setRelativeTime] = useState<string>('');
  const typeConfig = alertTypeConfig[alert.type];
  const Icon = typeConfig.icon;
  const isActive = alert.status === 'active';

  useEffect(() => {
    const updateTime = () => {
      setRelativeTime(formatDistanceToNow(new Date(alert.created_at), { addSuffix: true }));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [alert.created_at]);

  return (
    <Card
      className={`border-l-4 ${severityBorderConfig[alert.severity]} ${
        !isActive ? 'opacity-60 bg-gray-50' : ''
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div
              className={`p-2 rounded-lg ${
                isActive ? 'bg-gray-100' : 'bg-gray-200'
              } flex-shrink-0`}
            >
              <Icon className={`w-5 h-5 ${typeConfig.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                <SeverityBadge severity={alert.severity} />
              </div>
              {showPatientName && patientName && (
                <p className="text-sm font-medium text-gray-700 mb-0.5">
                  Patient: {patientName}
                </p>
              )}
              <p className="text-sm text-gray-500">{relativeTime}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 mb-3 leading-relaxed">{alert.description}</p>

        {/* Recommended Action */}
        {alert.recommended_action && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-blue-900 mb-1">
                  Recommended Action:
                </p>
                <p className="text-sm text-blue-800">{alert.recommended_action}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          {isActive ? (
            onAcknowledge ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAcknowledge(alert.id)}
                disabled={isAcknowledging}
                className="text-sm"
              >
                {isAcknowledging ? 'Acknowledging...' : 'Acknowledge'}
              </Button>
            ) : (
              <div className="text-sm text-gray-500">
                <span>Active Alert</span>
              </div>
            )
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Acknowledged</span>
              {alert.acknowledged_at && (
                <span className="text-xs">
                  {formatDistanceToNow(new Date(alert.acknowledged_at), { addSuffix: true })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
