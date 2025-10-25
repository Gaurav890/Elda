'use client';

import { useState } from 'react';
import { Patient } from '@/types/patient';
import { Schedule, ScheduleCreate } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';
import { ScheduleList } from '@/components/schedules/ScheduleList';
import { ScheduleForm } from '@/components/schedules/ScheduleForm';
import {
  usePatientSchedules,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useToggleScheduleActive,
} from '@/hooks/useSchedules';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface PatientRoutineTabProps {
  patient: Patient;
}

export function PatientRoutineTab({ patient }: PatientRoutineTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<Schedule | null>(null);

  // Fetch schedules
  const { data: schedulesData, isLoading } = usePatientSchedules(patient.id);

  // Mutations
  const createMutation = useCreateSchedule(patient.id);
  const updateMutation = useUpdateSchedule(patient.id);
  const deleteMutation = useDeleteSchedule(patient.id);
  const toggleMutation = useToggleScheduleActive(patient.id);

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setIsFormOpen(true);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setIsFormOpen(true);
  };

  const handleDeleteSchedule = (schedule: Schedule) => {
    setDeletingSchedule(schedule);
  };

  const confirmDelete = () => {
    if (deletingSchedule) {
      deleteMutation.mutate(deletingSchedule.id, {
        onSuccess: () => {
          setDeletingSchedule(null);
        },
      });
    }
  };

  const handleSubmitSchedule = (data: ScheduleCreate) => {
    if (editingSchedule) {
      // Update existing schedule
      updateMutation.mutate(
        { id: editingSchedule.id, data },
        {
          onSuccess: () => {
            setIsFormOpen(false);
            setEditingSchedule(null);
          },
        }
      );
    } else {
      // Create new schedule
      createMutation.mutate(data, {
        onSuccess: () => {
          setIsFormOpen(false);
        },
      });
    }
  };

  const handleToggleActive = (scheduleId: string, isActive: boolean) => {
    toggleMutation.mutate({ scheduleId, isActive });
  };

  const schedules = schedulesData?.schedules || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Daily Routine</h2>
          <p className="text-muted-foreground">
            Manage {patient.first_name}'s daily schedules and reminders
          </p>
        </div>
        <Button onClick={handleAddSchedule}>
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && schedules.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No schedules yet</h3>
          <p className="text-muted-foreground mb-6">
            Create a daily routine for {patient.first_name} to help them stay on track.
          </p>
          <Button onClick={handleAddSchedule}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Schedule
          </Button>
        </div>
      )}

      {/* Schedule List */}
      {!isLoading && schedules.length > 0 && (
        <ScheduleList
          schedules={schedules}
          onEdit={handleEditSchedule}
          onDelete={handleDeleteSchedule}
          onToggleActive={handleToggleActive}
        />
      )}

      {/* Schedule Form (Sheet) */}
      <ScheduleForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingSchedule(null);
          }
        }}
        schedule={editingSchedule}
        onSubmit={handleSubmitSchedule}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingSchedule} onOpenChange={(open) => !open && setDeletingSchedule(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this schedule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{deletingSchedule?.title}" from {patient.first_name}'s routine. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
