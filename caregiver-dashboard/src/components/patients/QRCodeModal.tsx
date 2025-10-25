'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { Download, RefreshCw, X, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  patientName: string;
}

interface QRCodeData {
  qr_code_data: string;
  setup_token: string;
  expires_in_minutes: number;
  patient_id: string;
}

export function QRCodeModal({
  open,
  onOpenChange,
  patientId,
  patientName,
}: QRCodeModalProps) {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Generate QR code when modal opens
  useEffect(() => {
    if (open && !qrData) {
      generateQRCode();
    }
  }, [open]);

  // Update time remaining countdown
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      if (now >= expiresAt) {
        setTimeRemaining('Expired');
        clearInterval(interval);
      } else {
        setTimeRemaining(formatDistanceToNow(expiresAt, { addSuffix: true }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const generateQRCode = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      const response = await fetch(
        `${apiUrl}/api/v1/patients/${patientId}/generate-code`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      const data: QRCodeData = await response.json();
      setQrData(data);

      // Calculate expiry time
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + data.expires_in_minutes);
      setExpiresAt(expiry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('patient-qr-code');
    if (!svg) return;

    // Create a canvas and draw the SVG
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 300;
    canvas.height = 300;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 300, 300);
        ctx.drawImage(img, 0, 0);

        // Download as PNG
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${patientName.replace(/\s+/g, '-')}-qr-code.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Device Setup QR Code</DialogTitle>
          <DialogDescription>
            Scan this QR code with the mobile app to set up {patientName}'s device
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {loading && (
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-muted-foreground">Generating QR code...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3 p-4 bg-red-50 rounded-lg w-full">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <p className="text-sm text-red-600 text-center">{error}</p>
              <Button onClick={generateQRCode} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {qrData && !loading && (
            <>
              {/* QR Code */}
              <div className="p-6 bg-white border-2 border-gray-200 rounded-lg">
                <QRCodeSVG
                  id="patient-qr-code"
                  value={qrData.qr_code_data}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>

              {/* Expiry Warning */}
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-md">
                <Clock className="h-4 w-4" />
                <span>
                  {timeRemaining === 'Expired' ? (
                    <strong>Code expired</strong>
                  ) : (
                    <>
                      Expires <strong>{timeRemaining}</strong>
                    </>
                  )}
                </span>
              </div>

              {/* Instructions */}
              <div className="w-full space-y-2 text-sm text-muted-foreground bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-blue-900">Setup Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Open the Elder Companion mobile app</li>
                  <li>Tap "Scan QR Code" on the welcome screen</li>
                  <li>Point camera at this QR code</li>
                  <li>Wait for confirmation</li>
                </ol>
              </div>

              {/* Actions */}
              <div className="flex gap-2 w-full">
                <Button
                  onClick={downloadQRCode}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  onClick={generateQRCode}
                  variant="outline"
                  className="flex-1 gap-2"
                  disabled={timeRemaining !== 'Expired'}
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
