import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ScanBarcode } from "lucide-react";

interface BarcodeScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDetected: (barcode: string) => void;
  busy?: boolean;
}

const hints = new Map([
  [
    DecodeHintType.POSSIBLE_FORMATS,
    [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
    ],
  ],
]);

/** Live camera barcode scanner with a manual-entry fallback. */
export const BarcodeScannerDialog = ({
  open,
  onOpenChange,
  onDetected,
  busy,
}: BarcodeScannerDialogProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manual, setManual] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setCameraError(null);

    const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 300 });
    reader
      .decodeFromVideoDevice(undefined, videoRef.current ?? undefined, (result) => {
        if (result && !cancelled) {
          controlsRef.current?.stop();
          onDetected(result.getText());
        }
      })
      .then((controls) => {
        if (cancelled) controls.stop();
        else controlsRef.current = controls;
      })
      .catch((err) => {
        console.error("Barcode camera error:", err);
        if (!cancelled) setCameraError("Camera unavailable — enter the barcode digits instead.");
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [open, onDetected]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanBarcode className="w-5 h-5" />
            Scan a barcode
          </DialogTitle>
          <DialogDescription>
            Point your camera at the barcode on the packet.
          </DialogDescription>
        </DialogHeader>

        {cameraError ? (
          <p className="text-sm text-muted-foreground">{cameraError}</p>
        ) : (
          <div className="relative rounded-2xl overflow-hidden bg-muted aspect-[4/3]">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-24 border-2 border-primary/80 rounded-xl" />
            {busy && (
              <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
          </div>
        )}

        <form
          className="flex gap-2 pt-1"
          onSubmit={(e) => {
            e.preventDefault();
            if (manual.trim()) onDetected(manual.trim());
          }}
        >
          <Input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="Or type the barcode number"
            inputMode="numeric"
            aria-label="Barcode number"
          />
          <Button type="submit" variant="secondary" disabled={busy || !manual.trim()}>
            Look up
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
