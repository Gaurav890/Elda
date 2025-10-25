// Generate Code Modal (Placeholder for future feature)

'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Smartphone } from 'lucide-react';

interface GenerateCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName?: string;
}

export function GenerateCodeModal({ open, onOpenChange, patientName }: GenerateCodeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Connection Code</DialogTitle>
          <DialogDescription>
            Generate a code for {patientName || 'your loved one'} to connect their mobile device
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <QrCode className="w-12 h-12 text-primary" />
          </div>

          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">Feature Coming Soon</h3>
            <p className="text-sm text-textSecondary max-w-sm">
              This feature will allow {patientName || 'your loved one'} to easily connect their
              mobile device to this dashboard by scanning a QR code or entering a simple 6-digit
              code.
            </p>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 w-full">
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <div className="text-sm text-textSecondary">
                <p className="font-medium text-textPrimary mb-1">What this will enable:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Quick mobile app pairing</li>
                  <li>Secure device connection</li>
                  <li>Automatic profile sync</li>
                  <li>Real-time health monitoring</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
