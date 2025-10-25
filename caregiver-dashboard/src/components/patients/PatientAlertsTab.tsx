'use client';

import { useState, useMemo } from 'react';
import { AlertCircle, Filter } from 'lucide-react';
import { usePatientAlerts, useAcknowledgeAlert } from '@/hooks/useAlerts';
import { AlertCard } from '@/components/alerts/AlertCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { AlertSeverity, AlertStatus, AlertFilters } from '@/types/alert';

interface PatientAlertsTabProps {
  patientId: string;
}

export function PatientAlertsTab({ patientId }: PatientAlertsTabProps) {
  const { toast } = useToast();
  const { data: alerts, isLoading, error } = usePatientAlerts(patientId);
  const acknowledgeAlertMutation = useAcknowledgeAlert();

  const [filters, setFilters] = useState<AlertFilters>({
    severity: 'all',
    status: 'all',
  });

  // Filter alerts based on selected filters
  const filteredAlerts = useMemo(() => {
    if (!alerts) return [];

    return alerts.filter((alert) => {
      const severityMatch =
        filters.severity === 'all' || alert.severity === filters.severity;
      const statusMatch = filters.status === 'all' || alert.status === filters.status;
      return severityMatch && statusMatch;
    });
  }, [alerts, filters]);

  // Sort by newest first
  const sortedAlerts = useMemo(() => {
    return [...filteredAlerts].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [filteredAlerts]);

  const handleAcknowledge = (alertId: string) => {
    acknowledgeAlertMutation.mutate(alertId, {
      onSuccess: () => {
        toast({
          title: 'Alert Acknowledged',
          description: 'The alert has been marked as acknowledged.',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to acknowledge alert. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm">Failed to load alerts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-sm text-gray-700">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Severity Filter */}
          <div>
            <label className="text-sm text-gray-600 mb-1.5 block">Severity</label>
            <Select
              value={filters.severity || 'all'}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  severity: value as AlertSeverity | 'all',
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-sm text-gray-600 mb-1.5 block">Status</label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  status: value as AlertStatus | 'all',
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Alert Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {sortedAlerts.length} {sortedAlerts.length === 1 ? 'alert' : 'alerts'} found
        </p>
        {filters.severity !== 'all' || filters.status !== 'all' ? (
          <button
            onClick={() => setFilters({ severity: 'all', status: 'all' })}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {/* Alert List */}
      {sortedAlerts.length === 0 ? (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 font-medium mb-1">No alerts found</p>
            <p className="text-sm text-gray-500">
              {filters.severity !== 'all' || filters.status !== 'all'
                ? 'Try adjusting your filters'
                : 'All good! No alerts for this patient.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={handleAcknowledge}
              isAcknowledging={acknowledgeAlertMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
