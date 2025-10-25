'use client';

// Care Circle Page

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Users, Search } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { PatientCard } from '@/components/patients/PatientCard';
import { EmptyState } from '@/components/common/EmptyState';
import { PatientListSkeleton } from '@/components/common/LoadingSkeleton';
import { AddPatientModal } from '@/components/patients/AddPatientModal';

export default function CareCirclePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: patients, isLoading, error } = usePatients();

  // Filter patients by search query
  const filteredPatients = patients?.filter((patient) => {
    const fullName = patient.full_name.toLowerCase();
    const displayName = patient.display_name.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || displayName.includes(query);
  });

  // Handle Add Patient button click
  const handleAddPatient = () => {
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-textPrimary">
            Care Circle
          </h1>
          <p className="text-textSecondary mt-1">
            Manage and monitor your loved ones
          </p>
        </div>
        <Button onClick={handleAddPatient}>
          <Plus className="w-5 h-5 mr-2" />
          Add Loved One
        </Button>
      </div>

      {/* Search bar - only show if there are patients */}
      {patients && patients.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Loading state */}
      {isLoading && <PatientListSkeleton count={6} />}

      {/* Error state */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
          <p className="text-destructive">
            Failed to load patients. Please try again.
          </p>
        </div>
      )}

      {/* Empty state - no patients */}
      {!isLoading && !error && (!patients || patients.length === 0) && (
        <EmptyState
          icon={
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
          }
          title="Let's start by caring for someone you love ❤️"
          description="Add your first loved one to start monitoring their health, setting up reminders, and staying connected with AI-powered insights."
          actionLabel="Add Your First Loved One"
          onAction={handleAddPatient}
        />
      )}

      {/* Empty search results */}
      {!isLoading &&
        !error &&
        patients &&
        patients.length > 0 &&
        filteredPatients?.length === 0 && (
          <EmptyState
            icon={<Search className="w-12 h-12" />}
            title="No patients found"
            description={`No patients match "${searchQuery}". Try a different search term.`}
          />
        )}

      {/* Patient grid */}
      {!isLoading && !error && filteredPatients && filteredPatients.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-textSecondary">
              {filteredPatients.length} {filteredPatients.length === 1 ? 'person' : 'people'} in
              your care circle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} alertCount={0} />
            ))}
          </div>
        </>
      )}

      {/* Add Patient Modal */}
      <AddPatientModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  );
}
