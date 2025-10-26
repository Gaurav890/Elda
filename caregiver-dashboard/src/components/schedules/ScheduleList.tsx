'use client';

import { Schedule, ScheduleType, DayOfWeek } from '@/types/schedule';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, Pill, Utensils, Activity, Calendar, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduleListProps {
  schedules: Schedule[];
  onEdit: (schedule: Schedule) => void;
  onDelete: (schedule: Schedule) => void;
  onToggleActive: (scheduleId: string, isActive: boolean) => void;
}

const scheduleTypeConfig: Record<
  ScheduleType,
  { icon: any; label: string; color: string; bgColor: string }
> = {
  medication: {
    icon: Pill,
    label: 'Medication',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  meal: {
    icon: Utensils,
    label: 'Meal',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  exercise: {
    icon: Activity,
    label: 'Exercise',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
  },
  appointment: {
    icon: Calendar,
    label: 'Appointment',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  other: {
    icon: MoreHorizontal,
    label: 'Other',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
};

const dayLabels: Record<DayOfWeek, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

function formatTime(time: string): string {
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return time;
  }
}

function formatRecurrence(schedule: Schedule): string {
  if (schedule.recurrence_type === 'daily') {
    return 'Daily';
  }
  if (schedule.recurrence_type === 'weekly' && schedule.days_of_week) {
    return schedule.days_of_week.map((day) => dayLabels[day]).join(', ');
  }
  return 'Custom';
}

export function ScheduleList({ schedules, onEdit, onDelete, onToggleActive }: ScheduleListProps) {
  if (schedules.length === 0) {
    return null;
  }

  return (
    <>
      {/* Desktop: Table view */}
      <div className="hidden md:block">
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Recurrence</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => {
                const typeConfig = scheduleTypeConfig[schedule.type];
                const Icon = typeConfig.icon;

                return (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn('gap-1.5', typeConfig.bgColor, typeConfig.color)}
                      >
                        <Icon className="h-3 w-3" />
                        {typeConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{schedule.title}</div>
                        {schedule.description && (
                          <div className="text-sm text-muted-foreground">
                            {schedule.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatTime(schedule.time)}</TableCell>
                    <TableCell className="text-sm">{formatRecurrence(schedule)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={schedule.is_active}
                        onCheckedChange={(checked) => onToggleActive(schedule.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(schedule)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(schedule)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile: Card view */}
      <div className="md:hidden space-y-4">
        {schedules.map((schedule) => {
          const typeConfig = scheduleTypeConfig[schedule.type];
          const Icon = typeConfig.icon;

          return (
            <Card key={schedule.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <Badge
                      variant="secondary"
                      className={cn('gap-1.5', typeConfig.bgColor, typeConfig.color)}
                    >
                      <Icon className="h-3 w-3" />
                      {typeConfig.label}
                    </Badge>
                    <Switch
                      checked={schedule.is_active}
                      onCheckedChange={(checked) => onToggleActive(schedule.id, checked)}
                    />
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-semibold">{schedule.title}</h3>
                    {schedule.description && (
                      <p className="text-sm text-muted-foreground mt-1">{schedule.description}</p>
                    )}
                  </div>

                  {/* Time & Recurrence */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium">{formatTime(schedule.time)}</span>
                    <span className="text-muted-foreground">{formatRecurrence(schedule)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(schedule)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(schedule)}
                      className="flex-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
