'use client';

import { useState } from 'react';
import { Bell, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { usePatients } from '@/hooks/usePatients';
import { useAlerts } from '@/hooks/useAlerts';
import { AlertCard } from '@/components/alerts/AlertCard';
import { AlertSeverity, AlertStatus } from '@/types/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function AlertsPage() {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [patientFilter, setPatientFilter] = useState<string>('all');

  // Fetch patients for filter dropdown
  const { data: patients, isLoading: patientsLoading } = usePatients();

  // For now, we'll use the first patient's alerts as a demo
  // In a real app, you'd fetch alerts for all patients from a global endpoint
  const { data: alerts, isLoading: alertsLoading } = useAlerts(
    patients?.[0]?.id || '1'
  );

  // Filter alerts
  const filteredAlerts = alerts?.filter((alert) => {
    if (severityFilter !== 'all' && alert.severity !== severityFilter) {
      return false;
    }
    if (statusFilter !== 'all' && alert.status !== statusFilter) {
      return false;
    }
    // Patient filter would be implemented when we have multi-patient alerts
    return true;
  });

  // Count unacknowledged alerts
  const unacknowledgedCount = alerts?.filter(
    (alert) => alert.status === AlertStatus.ACTIVE
  ).length || 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
              <p className="text-sm text-muted-foreground">
                Monitor and manage alerts across all patients
              </p>
            </div>
          </div>
          {unacknowledgedCount > 0 && (
            <Badge variant="destructive" className="text-base px-3 py-1">
              {unacknowledgedCount} Active
            </Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          {/* Severity Filter */}
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value={AlertSeverity.LOW}>Low</SelectItem>
              <SelectItem value={AlertSeverity.MEDIUM}>Medium</SelectItem>
              <SelectItem value={AlertSeverity.HIGH}>High</SelectItem>
              <SelectItem value={AlertSeverity.CRITICAL}>Critical</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={AlertStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={AlertStatus.ACKNOWLEDGED}>
                Acknowledged
              </SelectItem>
              <SelectItem value={AlertStatus.RESOLVED}>Resolved</SelectItem>
            </SelectContent>
          </Select>

          {/* Patient Filter */}
          <Select
            value={patientFilter}
            onValueChange={setPatientFilter}
            disabled={patientsLoading}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Patients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              {patients?.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.full_name || patient.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(severityFilter !== 'all' ||
            statusFilter !== 'all' ||
            patientFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSeverityFilter('all');
                setStatusFilter('all');
                setPatientFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {alertsLoading || patientsLoading ? (
          // Loading state
          <div className="space-y-4 max-w-4xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : filteredAlerts && filteredAlerts.length > 0 ? (
          // Alerts list
          <div className="space-y-4 max-w-4xl mx-auto">
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                patientId={patients?.[0]?.id || '1'}
                showPatientName={true}
                patientName={
                  patients?.[0]?.full_name || patients?.[0]?.display_name
                }
              />
            ))}
          </div>
        ) : (
          // Empty state
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No alerts found</h3>
              <p className="text-sm text-muted-foreground">
                {severityFilter !== 'all' ||
                statusFilter !== 'all' ||
                patientFilter !== 'all'
                  ? 'Try adjusting your filters to see more alerts.'
                  : 'All your patients are doing well. Alerts will appear here when they need attention.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
