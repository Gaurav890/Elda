import { AlertSeverity } from '@/types/alert';
import { Badge } from '@/components/ui/badge';

interface SeverityBadgeProps {
  severity: AlertSeverity;
  className?: string;
}

const severityConfig = {
  [AlertSeverity.LOW]: {
    label: 'Low',
    variant: 'secondary' as const,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  },
  [AlertSeverity.MEDIUM]: {
    label: 'Medium',
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  },
  [AlertSeverity.HIGH]: {
    label: 'High',
    variant: 'secondary' as const,
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  },
  [AlertSeverity.CRITICAL]: {
    label: 'Critical',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = severityConfig[severity];

  return (
    <Badge variant={config.variant} className={`${config.className} ${className || ''}`}>
      {config.label}
    </Badge>
  );
}
