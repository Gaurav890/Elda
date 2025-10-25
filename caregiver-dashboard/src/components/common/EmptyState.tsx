// Empty State Component

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="mb-4 text-textSecondary">{icon}</div>}

      <h3 className="text-xl font-semibold text-textPrimary mb-2">{title}</h3>

      <p className="text-textSecondary max-w-md mb-6">{description}</p>

      {actionLabel && onAction && (
        <Button onClick={onAction} size="lg">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
