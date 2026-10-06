import React, { useState } from 'react';
import { useCivic } from '../../context/CivicContext';
import { Problem } from '../../types';
import { Camera, Check, ShieldCheck, Upload, X } from 'lucide-react';

interface Props {
  problem: Problem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CompletionProofModal: React.FC<Props> = ({ problem, isOpen, onClose }) => {
  const { submitCompletionProof } = useCivic();

  const [note, setNote] = useState(
    'Civil rectification completed, road surface leveled and compacted with hot-mix asphalt. Debris cleared.'
  );
  const [proofImage, setProofImage] = useState<string>(problem?.image || '');

  if (!isOpen || !problem) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitCompletionProof(problem.id, {
      completionImage: proofImage || problem.image,
      completionNote: note,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-card-theme rounded-2xl max-w-lg w-full border border-theme shadow-xl overflow-hidden my-6 theme-transition animate-fade-in">
        <div className="p-6 border-b border-theme flex items-center justify-between bg-surface theme-transition">
          <div>
            <h3 className="text-base font-bold text-theme-primary flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-olive-primary" />
              Submit Work Completion Evidence
            </h3>
            <p className="text-xs text-theme-muted mt-0.5">
              Transitions {problem.id} to "Pending Citizen Verification"
            </p>
          </div>
          <button onClick={onClose} className="text-theme-muted hover:text-theme-primary p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-theme-primary mb-1">
              Field Completion Verification Note
            </label>
            <textarea
              required
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="State the technical specifications of work done (materials used, area paved, inspection results)..."
              className="w-full px-3 py-2 bg-surface border border-theme rounded-xl text-theme-primary focus:border-olive-primary focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-theme-primary mb-1">
              Photographic Evidence of Rectification
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1 border border-dashed border-theme rounded-xl p-3 text-center hover:bg-surface relative cursor-pointer theme-transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Camera className="w-5 h-5 text-theme-muted mx-auto mb-1" />
                <span className="text-theme-secondary block font-medium">Click to upload completion photo</span>
              </div>
              <div className="w-24 h-20 rounded-xl bg-surface overflow-hidden border border-theme shrink-0">
                {proofImage ? (
                  <img
                    src={proofImage}
                    alt="Proof preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-theme-muted">
                    No image
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-3 bg-olive-soft/40 rounded-xl border border-theme text-theme-secondary text-[11px] leading-relaxed">
            <strong className="text-olive-dark">Closed-Loop Accountability:</strong> Once submitted, the complaint does not close automatically. The citizen will be prompted to verify if the defect has actually been resolved on the ground.
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-theme">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-theme-secondary hover:text-theme-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold bg-olive-primary text-white rounded-xl hover:bg-olive-dark transition-colors shadow-xs card-hover"
            >
              Submit & Request Citizen Sign-off
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
