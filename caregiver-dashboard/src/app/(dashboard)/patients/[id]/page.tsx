'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { usePatient } from '@/hooks/usePatients';
import { PatientDetailHeader } from '@/components/patients/PatientDetailHeader';
import { PatientOverviewTab } from '@/components/patients/PatientOverviewTab';
import { PatientRoutineTab } from '@/components/patients/PatientRoutineTab';
import { PatientConversationsTab } from '@/components/patients/PatientConversationsTab';
import { PatientAlertsTab } from '@/components/patients/PatientAlertsTab';
import { PatientReportsTab } from '@/components/patients/PatientReportsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'routine', label: 'Routine' },
  { value: 'reports', label: 'Reports' },
  { value: 'conversations', label: 'Conversations' },
  { value: 'alerts', label: 'Alerts' },
  { value: 'notes', label: 'Notes to AI' },
] as const;

type TabValue = typeof TABS[number]['value'];

export default function PatientDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = params.id as string;
  const activeTab = (searchParams.get('tab') || 'overview') as TabValue;

  // Fetch patient data
  const { data: patient, isLoading, error } = usePatient(patientId);

  // Handle tab change
  const handleTabChange = (value: string) => {
    router.push(`/patients/${patientId}?tab=${value}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading patient...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !patient) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The patient you're looking for doesn't exist or you don't have access to view them.
          </p>
          <Link href="/care-circle">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Care Circle
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Back Button */}
      <div className="border-b bg-white px-6 py-3">
        <Link href="/care-circle">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Care Circle
          </Button>
        </Link>
      </div>

      {/* Patient Header */}
      <PatientDetailHeader
        patient={patient}
        onEdit={() => {
          // TODO: Open edit modal
          console.log('Edit patient:', patient.id);
        }}
        onTriggerReminder={() => {
          // TODO: Implement trigger reminder
          console.log('Trigger reminder for:', patient.id);
        }}
        onNudge={() => {
          // TODO: Implement nudge
          console.log('Nudge patient:', patient.id);
        }}
      />

      {/* Tabs Navigation */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full">
          <div className="border-b bg-white px-6">
            <TabsList className="h-12 w-full justify-start rounded-none border-b-0 bg-transparent p-0">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-3 font-semibold text-muted-foreground shadow-none transition-none hover:text-foreground data-[state=active]:border-blue-600 data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="overview" className="mt-0">
              <PatientOverviewTab patient={patient} />
            </TabsContent>

            <TabsContent value="routine" className="mt-0">
              <PatientRoutineTab patient={patient} />
            </TabsContent>

            <TabsContent value="reports" className="mt-0">
              <PatientReportsTab patientId={patientId} />
            </TabsContent>

            <TabsContent value="conversations" className="mt-0">
              <PatientConversationsTab patient={patient} />
            </TabsContent>

            <TabsContent value="alerts" className="mt-0">
              <PatientAlertsTab patientId={patientId} />
            </TabsContent>

            <TabsContent value="notes" className="mt-0">
              <div className="rounded-lg border bg-white p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">Notes to AI Tab</h3>
                <p className="text-sm text-muted-foreground">
                  This tab will show notes and instructions for the AI agent.
                  <br />
                  Coming soon
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
