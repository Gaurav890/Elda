'use client';

import { useState, useEffect, useRef } from 'react';
import { Schedule, ScheduleCreate, ScheduleType, RecurrenceType, DayOfWeek } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

interface ScheduleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: Schedule | null;
  onSubmit: (data: ScheduleCreate) => void;
  isSubmitting?: boolean;
}

const daysOfWeek: { value: DayOfWeek; label: string }[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export function ScheduleForm({
  open,
  onOpenChange,
  schedule,
  onSubmit,
  isSubmitting = false,
}: ScheduleFormProps) {
  const [formData, setFormData] = useState<ScheduleCreate>({
    title: '',
    description: '',
    type: 'medication',
    time: '09:00',
    recurrence_type: 'daily',
    days_of_week: [],
    reminder_advance_minutes: 60,
    is_active: true,
  });

  // Track previous open state to detect when modal opens
  const prevOpenRef = useRef(open);

  // Reset form only when modal first opens or schedule changes
  useEffect(() => {
    const justOpened = open && !prevOpenRef.current;
    prevOpenRef.current = open;

    // Only reset when modal just opened
    if (justOpened) {
      if (schedule) {
        // Editing existing schedule
        setFormData({
          title: schedule.title,
          description: schedule.description || '',
          type: schedule.type,
          time: schedule.time,
          recurrence_type: schedule.recurrence_type,
          days_of_week: schedule.days_of_week || [],
          reminder_advance_minutes: schedule.reminder_advance_minutes,
          is_active: schedule.is_active,
        });
      } else {
        // Creating new schedule
        setFormData({
          title: '',
          description: '',
          type: 'medication',
          time: '09:00',
          recurrence_type: 'daily',
          days_of_week: [],
          reminder_advance_minutes: 60,
          is_active: true,
        });
      }
    }
  }, [open, schedule]); // Listen to both open and schedule

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare data for submission
    const submitData = { ...formData };

    // If recurrence is daily, ensure days_of_week includes all days
    if (submitData.recurrence_type === 'daily') {
      submitData.days_of_week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    }

    onSubmit(submitData);
  };

  const handleDayToggle = (day: DayOfWeek, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      days_of_week: checked
        ? [...(prev.days_of_week || []), day]
        : (prev.days_of_week || []).filter((d) => d !== day),
    }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>{schedule ? 'Edit Schedule' : 'Add Schedule'}</SheetTitle>
            <SheetDescription>
              {schedule
                ? 'Update the schedule details below.'
                : 'Create a new schedule for the patient.'}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 py-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Morning Medication"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional details about this schedule"
                rows={3}
              />
            </div>

            {/* Schedule Type */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: ScheduleType) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="meal">Meal</SelectItem>
                  <SelectItem value="exercise">Exercise</SelectItem>
                  <SelectItem value="appointment">Appointment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label htmlFor="time">
                Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time || '09:00'}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>

            {/* Recurrence Type */}
            <div className="space-y-2">
              <Label htmlFor="recurrence_type">
                Recurrence <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.recurrence_type}
                onValueChange={(value: RecurrenceType) =>
                  setFormData({ ...formData, recurrence_type: value })
                }
              >
                <SelectTrigger id="recurrence_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Days of Week (for weekly recurrence) */}
            {formData.recurrence_type === 'weekly' && (
              <div className="space-y-2">
                <Label>Days of Week</Label>
                <div className="grid grid-cols-2 gap-3">
                  {daysOfWeek.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={day.value}
                        checked={formData.days_of_week?.includes(day.value)}
                        onCheckedChange={(checked) => handleDayToggle(day.value, checked as boolean)}
                      />
                      <Label htmlFor={day.value} className="text-sm font-normal cursor-pointer">
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reminder Advance Minutes */}
            <div className="space-y-2">
              <Label htmlFor="reminder_advance_minutes">Reminder advance time (minutes)</Label>
              <Input
                id="reminder_advance_minutes"
                type="number"
                min="0"
                value={formData.reminder_advance_minutes ?? 60}
                onChange={(e) =>
                  setFormData({ ...formData, reminder_advance_minutes: parseInt(e.target.value, 10) || 0 })
                }
              />
              <p className="text-xs text-muted-foreground">
                Send reminder this many minutes before scheduled time
              </p>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch
                id="is_active"
                checked={formData.is_active ?? true}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : schedule ? 'Update' : 'Create'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
