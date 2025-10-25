'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ConversationTimeline } from '@/components/conversations/ConversationTimeline';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePatientConversations } from '@/hooks/useConversations';
import { DATE_FILTER_OPTIONS } from '@/types/conversation';
import { Patient } from '@/types/patient';

interface PatientConversationsTabProps {
  patient: Patient;
}

export function PatientConversationsTab({ patient }: PatientConversationsTabProps) {
  const [selectedDays, setSelectedDays] = useState<number | undefined>(7); // Default: Last 7 days

  // Fetch conversations with filter
  const { data, isLoading, isError, error } = usePatientConversations(
    patient.id.toString(),
    { days: selectedDays }
  );

  const conversations = data?.conversations || [];
  const patientName = patient.full_name || patient.display_name || 'Patient';

  return (
    <div className="space-y-6">
      {/* Header with filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Conversations
          </h3>
          <p className="text-sm text-gray-500">
            View all AI conversations with {patientName}
          </p>
        </div>

        {/* Date filter */}
        <Select
          value={selectedDays?.toString() || 'all'}
          onValueChange={(value) => {
            setSelectedDays(value === 'all' ? undefined : parseInt(value));
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            {DATE_FILTER_OPTIONS.map((option) => (
              <SelectItem
                key={option.label}
                value={option.days?.toString() || 'all'}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Error state */}
      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load conversations. {error instanceof Error ? error.message : 'Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Conversation timeline */}
      {!isLoading && !isError && (
        <div>
          {/* Stats */}
          {conversations.length > 0 && (
            <div className="mb-4 text-sm text-gray-600">
              Showing {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              {selectedDays && ` from the last ${selectedDays} day${selectedDays !== 1 ? 's' : ''}`}
            </div>
          )}

          <ConversationTimeline
            conversations={conversations}
            patientName={patientName}
            autoScroll={true}
          />
        </div>
      )}
    </div>
  );
}
