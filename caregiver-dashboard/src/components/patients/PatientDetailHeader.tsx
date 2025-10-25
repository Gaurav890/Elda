'use client';

import { Patient } from '@/types/patient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Bell, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PatientDetailHeaderProps {
  patient: Patient;
  onEdit?: () => void;
  onTriggerReminder?: () => void;
  onNudge?: () => void;
}

export function PatientDetailHeader({
  patient,
  onEdit,
  onTriggerReminder,
  onNudge,
}: PatientDetailHeaderProps) {
  // Get initials for avatar fallback
  const initials = `${patient.first_name[0]}${patient.last_name[0]}`.toUpperCase();

  // Format last activity
  const lastActivity = patient.last_active_at
    ? `Active ${formatDistanceToNow(new Date(patient.last_active_at), { addSuffix: true })}`
    : 'No recent activity';

  return (
    <div className="border-b bg-white">
      <div className="px-6 py-6">
        <div className="flex items-start justify-between">
          {/* Left side: Avatar + Info */}
          <div className="flex items-start gap-4">
            {/* Large Avatar */}
            <Avatar className="h-20 w-20">
              <AvatarImage src={patient.profile_photo_url} alt={patient.full_name} />
              <AvatarFallback className="text-2xl bg-blue-100 text-blue-700">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Name, Age, Status */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {patient.full_name}
                </h1>
                <span className="text-2xl font-normal text-gray-500">
                  {patient.age}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant={patient.is_active ? 'default' : 'secondary'}
                  className={
                    patient.is_active
                      ? 'bg-green-100 text-green-800 hover:bg-green-100'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                  }
                >
                  {patient.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {lastActivity}
                </span>
              </div>
            </div>
          </div>

          {/* Right side: Quick Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onTriggerReminder}
              className="gap-2"
            >
              <Bell className="h-4 w-4" />
              Trigger Reminder
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNudge}
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              Nudge
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
