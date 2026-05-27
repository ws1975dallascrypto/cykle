'use client';

import { useRef, useState } from 'react';
import { Camera, X, CheckCircle, Loader2 } from 'lucide-react';
import { useUploadProof, useUpdateLegStatus } from '@/hooks/useDriverLegs';
import { cn } from '@/lib/utils';

interface ProofUploadSheetProps {
  legId: string;
  legType: 'PICKUP' | 'DELIVERY';
  open: boolean;
  onClose: () => void;
}

export function ProofUploadSheet({ legId, legType, open, onClose }: ProofUploadSheetProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState(false);

  const { mutateAsync: uploadProof } = useUploadProof();
  const { mutate: updateStatus, isPending: updatingStatus } = useUpdateLegStatus();
  const [uploading, setUploading] = useState(false);

  const isPickup = legType === 'PICKUP';

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleSubmit = async () => {
    setUploading(true);
    try {
      // In production, upload to Cloudinary/S3 and get back URL.
      // For now, send a placeholder URL; replace with real upload logic.
      const proofPhotoUrl = preview ?? '';
      await uploadProof({ legId, notes, proofPhotoUrl });
      updateStatus({ legId, status: 'COMPLETED' });
      setDone(true);
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60">
      <div className="rounded-t-3xl bg-slate-900 px-5 pb-safe pt-5">
        {/* Handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-700" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-white">
            {isPickup ? 'Confirm Pick-up' : 'Confirm Delivery'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 py-10">
            <CheckCircle className="h-16 w-16 text-emerald-400" />
            <p className="text-lg font-black text-white">
              {isPickup ? 'Pick-up Confirmed!' : 'Delivery Confirmed!'}
            </p>
            <button
              onClick={() => { onClose(); setDone(false); setPreview(null); setNotes(''); }}
              className="rounded-xl bg-slate-700 px-8 py-3 text-sm font-bold text-white"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Photo capture */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFile}
            />

            <button
              onClick={() => fileRef.current?.click()}
              className={cn(
                'w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-8 mb-4 transition-colors',
                preview ? 'border-emerald-500' : 'border-slate-600 hover:border-slate-400'
              )}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Proof" className="h-40 w-full object-cover rounded-xl" />
              ) : (
                <>
                  <Camera className="h-10 w-10 text-slate-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-400">Take a photo as proof</p>
                </>
              )}
            </button>

            {/* Notes */}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes (optional) — e.g. left with guard, customer not home…"
              rows={3}
              className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none resize-none mb-5"
            />

            <button
              onClick={handleSubmit}
              disabled={!preview || uploading || updatingStatus}
              className={cn(
                'w-full rounded-2xl py-4 text-base font-black text-white transition-all active:scale-[0.98] mb-4',
                preview && !uploading
                  ? 'bg-emerald-500 active:bg-emerald-600'
                  : 'bg-slate-700 opacity-50 cursor-not-allowed'
              )}
            >
              {uploading || updatingStatus ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> Submitting…
                </span>
              ) : (
                isPickup ? 'Confirm Pick-up' : 'Confirm Delivery'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
