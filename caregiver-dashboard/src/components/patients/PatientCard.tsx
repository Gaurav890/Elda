// Patient Card Component

'use client';

import { Patient } from '@/types/patient';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Eye, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PatientCardProps {
  patient: Patient;
  alertCount?: number;
}

export function PatientCard({ patient, alertCount = 0 }: PatientCardProps) {
  const router = useRouter();

  // Get initials for avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Format last activity time
  const formatLastActivity = (lastActiveAt?: string) => {
    if (!lastActiveAt) return 'Never';
    try {
      return formatDistanceToNow(new Date(lastActiveAt), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  // Navigate to patient detail page
  const handleViewPatient = () => {
    router.push(`/patients/${patient.id}`);
  };

  // Placeholder for trigger reminder
  const handleTriggerReminder = () => {
    // TODO: Implement trigger reminder functionality
    console.log('Trigger reminder for patient:', patient.id);
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={patient.profile_photo_url} alt={patient.full_name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {getInitials(patient.first_name, patient.last_name)}
              </AvatarFallback>
            </Avatar>
            {alertCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 rounded-full"
              >
                {alertCount}
              </Badge>
            )}
          </div>

          {/* Patient Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-semibold text-textPrimary truncate">
                {patient.full_name}
              </h3>
              <Badge variant={patient.is_active ? 'default' : 'secondary'} className="ml-2">
                {patient.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <p className="text-sm text-textSecondary mb-2">Age: {patient.age}</p>

            <div className="flex items-center text-xs text-textSecondary">
              <span className="flex items-center">
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                    patient.is_active ? 'bg-success' : 'bg-gray-400'
                  }`}
                />
                Last active {formatLastActivity(patient.last_active_at)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-0">
        <Button onClick={handleViewPatient} className="flex-1" size="sm">
          <Eye className="mr-2 h-4 w-4" />
          View
        </Button>
        <Button
          onClick={handleTriggerReminder}
          variant="outline"
          className="flex-1"
          size="sm"
        >
          <Bell className="mr-2 h-4 w-4" />
          Remind
        </Button>
      </CardFooter>
    </Card>
  );
}
