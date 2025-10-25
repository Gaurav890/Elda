// Multi-Step Form Wrapper Component

import { ReactNode } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MultiStepFormProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  canGoNext: boolean;
  isSubmitting?: boolean;
  children: ReactNode;
}

export function MultiStepForm({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSubmit,
  canGoNext,
  isSubmitting = false,
  children,
}: MultiStepFormProps) {
  const progress = (currentStep / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-textSecondary">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-textSecondary">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Form content */}
      <div className="min-h-[400px]">{children}</div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isFirstStep || isSubmitting}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {isLastStep ? (
          <Button type="button" onClick={onSubmit} disabled={!canGoNext || isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        ) : (
          <Button type="button" onClick={onNext} disabled={!canGoNext}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
