'use client';

// Care Circle Page

import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';

export default function CareCirclePage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-textPrimary">
            Care Circle
          </h1>
          <p className="text-textSecondary mt-1">
            Manage and monitor your loved ones
          </p>
        </div>
        <Button>
          <Plus className="w-5 h-5 mr-2" />
          Add Loved One
        </Button>
      </div>

      {/* Empty state */}
      <div className="bg-surface rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-serif font-bold text-textPrimary mb-2">
          Let's start by caring for someone you love ❤️
        </h2>
        <p className="text-textSecondary mb-6 max-w-md mx-auto">
          Add your first loved one to start monitoring their health, setting up
          reminders, and staying connected with AI-powered insights.
        </p>
        <Button>
          <Plus className="w-5 h-5 mr-2" />
          Add Your First Loved One
        </Button>
      </div>
    </div>
  );
}
