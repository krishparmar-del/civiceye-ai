import React, { useState, useEffect } from 'react';
import { useCivic } from '../../context/CivicContext';
import { ProblemCategory, Problem } from '../../types';
import {
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Navigation,
  Shield,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (problem: Problem) => void;
}

export const ReportProblemModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser, submitNewProblem, showToast } = useCivic();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProblemCategory | 'AI_DETECT'>('AI_DETECT');
  const [block, setBlock] = useState(currentUser?.block || 'Tilak Nagar');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(22.7155);
  const [longitude, setLongitude] = useState(75.8924);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');

  // AI & submission flow stages
  const [stage, setStage] = useState<'form' | 'analyzing' | 'revealing'>('form');
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [analyzedProblem, setAnalyzedProblem] = useState<Problem | null>(null);

  const analysisSteps = [
    'Processing report & visual evidence',
    'Analyzing structural defect with AI',
    'Identifying infrastructure category',
    'Estimating risk severity & impact score',
    'Routing to responsible municipal department',
  ];

  if (!isOpen) return null;

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setAddress(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (${block})`);
          showToast('GPS coordinates acquired', 'success');
        },
        () => {
          setLatitude(22.7155);
          setLongitude(75.8924);
          setAddress(`${block}, Indore`);
        },
        { timeout: 4000 }
      );
    }
  };

  // Fast client-side image compression so uploads don't block the network
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          setImagePreview(compressed);
          setImageBase64(compressed);
        } else {
          const raw = event.target?.result as string;
          setImagePreview(raw);
          setImageBase64(raw);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleQuickPreset = (type: 'pothole' | 'light' | 'drain') => {
    if (type === 'pothole') {
      setTitle('Large road pothole outside Hospital crossing');
      setDescription('Deep asphalt crater eroding into subgrade base. Two-wheelers skidding during night hours.');
      setCategory('Pothole');
      setImagePreview('/src/assets/images/civic_pothole_asphalt_1791267008533.jpg');
      setImageBase64('');
    } else if (type === 'light') {
      setTitle('Damaged Streetlight Pole with exposed wiring');
      setDescription('Streetlamp unlit for consecutive nights, dark intersection near residential lane.');
      setCategory('Streetlight');
      setImagePreview('/src/assets/images/civic_broken_streetlight_1791267059050.jpg');
      setImageBase64('');
    } else {
      setTitle('Open stormwater drain chamber without slab');
      setDescription('Missing concrete cover over pedestrian sidewalk. Critical falling hazard for pedestrians.');
      setCategory('Drainage');
      setImagePreview('/src/assets/images/civic_drainage_overflow_1791267077020.jpg');
      setImageBase64('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please provide a title and description.', 'warning');
      return;
    }

    setStage('analyzing');
    setAnalysisStep(0);

    // Fast, responsive step ticker (110ms per step)
    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev < analysisSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 110);

    try {
      const created = await submitNewProblem({
        title,
        description,
        category: category === 'AI_DETECT' ? undefined : category,
        image: imagePreview || '/src/assets/images/civic_pothole_asphalt_1791267008533.jpg',
        imageBase64: imageBase64 || undefined,
        latitude,
        longitude,
        block,
        address: address || `${block}, Indore`,
      });

      clearInterval(stepInterval);
      setAnalysisStep(analysisSteps.length - 1);
      setAnalyzedProblem(created);

      // Instantly reveal the AI classification without forced delay
      setStage('revealing');
    } catch (err: any) {
      clearInterval(stepInterval);
      setStage('form');
    }
  };

  const handleFinish = () => {
    if (analyzedProblem) {
      onSuccess(analyzedProblem);
    }
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('AI_DETECT');
    setImagePreview('');
    setImageBase64('');
    setStage('form');
    setAnalysisStep(0);
    setAnalyzedProblem(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-card-theme rounded-2xl max-w-xl w-full border border-theme shadow-xl overflow-hidden my-6 theme-transition animate-fade-in">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-theme flex items-center justify-between bg-surface theme-transition">
          <div>
            <h3 className="text-base font-bold text-theme-primary">
              Report an Infrastructure Problem
            </h3>
            <p className="text-xs text-theme-muted mt-0.5">
              Submit civic defect for AI classification & automated municipal routing
            </p>
          </div>
          <button
            onClick={() => {
              if (stage === 'revealing' && analyzedProblem) {
                handleFinish();
              } else {
                onClose();
                resetForm();
              }
            }}
            className="text-theme-muted hover:text-theme-primary p-1.5 rounded-lg border border-theme bg-card-theme shadow-xs"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Analysis Stepper Experience */}
        {stage === 'analyzing' ? (
          <div className="p-8 sm:p-10 text-center space-y-6 animate-fade-in">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-olive-soft/40 border border-theme text-olive-primary flex items-center justify-center mx-auto">
                <Loader2 className="w-6 h-6 animate-spin stroke-[2]" />
              </div>
              <h4 className="text-lg font-bold text-theme-primary">
                Analyzing your report with AI
              </h4>
              <p className="text-xs text-theme-muted max-w-xs mx-auto">
                CivicEye AI is assessing defect severity, community impact, and municipal routing.
              </p>
            </div>

            {/* Stepped checklist */}
            <div className="max-w-xs mx-auto bg-surface p-4 rounded-xl border border-theme text-left space-y-2.5 text-xs">
              {analysisSteps.map((s, index) => {
                const isDone = index <= analysisStep;
                const isCurrent = index === analysisStep;

                return (
                  <div
                    key={s}
                    className={`flex items-center gap-2.5 transition-all duration-150 ${
                      isDone ? 'text-theme-primary font-medium' : 'text-theme-muted opacity-40'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] transition-colors ${
                        isDone
                          ? 'bg-olive-primary text-white'
                          : 'border border-theme text-transparent'
                      }`}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{s}</span>
                    {isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-olive-primary animate-pulse ml-auto"></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : stage === 'revealing' && analyzedProblem ? (
          /* Instant AI Result Reveal & Confirmation Screen */
          <div className="p-6 sm:p-8 text-center space-y-6 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-olive-primary uppercase tracking-wider">
                  AI Classification Complete
                </span>
                <span className="font-mono text-xs font-bold text-theme-muted px-2 py-0.5 rounded bg-surface border border-theme">
                  {analyzedProblem.id}
                </span>
              </div>
              <h4 className="text-xl font-bold text-theme-primary">
                {analyzedProblem.category} Identified
              </h4>
              <p className="text-xs text-theme-muted">
                Routed to <strong className="text-theme-primary">{analyzedProblem.assignedOfficial?.name}</strong> ({analyzedProblem.department})
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-xs">
              <div className="bg-surface p-3.5 rounded-xl border border-theme text-center">
                <span className="text-[10px] text-theme-muted block uppercase font-medium">Estimated Severity</span>
                <span className="text-base font-bold text-olive-dark">
                  {analyzedProblem.severity}
                </span>
              </div>

              <div className="bg-surface p-3.5 rounded-xl border border-theme text-center">
                <span className="text-[10px] text-theme-muted block uppercase font-medium">Priority Score</span>
                <span className="text-base font-bold text-theme-primary tabular-nums">
                  {analyzedProblem.priorityScore} <span className="text-xs font-normal text-theme-muted">/ 100</span>
                </span>
              </div>
            </div>

            {analyzedProblem.aiAnalysis?.recommendedAction && (
              <div className="p-3 bg-surface border border-theme rounded-xl max-w-sm mx-auto text-left space-y-1">
                <span className="text-[10px] uppercase font-bold text-olive-dark tracking-wider block">
                  AI Recommended Action
                </span>
                <p className="text-xs text-theme-secondary">
                  "{analyzedProblem.aiAnalysis.recommendedAction}"
                </p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleFinish}
                className="w-full sm:w-auto px-6 py-2.5 bg-olive-primary hover:bg-olive-dark text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 card-hover"
              >
                <span>View Problem in Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Form Entry Screen */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Quick Presets Strip for fast testing */}
            <div className="bg-surface p-2.5 rounded-xl border border-theme flex items-center justify-between gap-2">
              <span className="font-semibold text-theme-secondary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-olive-primary" /> Test Presets:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickPreset('pothole')}
                  className="px-2 py-1 bg-card-theme border border-theme rounded text-[11px] text-theme-primary hover:border-olive-primary transition-colors"
                >
                  Pothole
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('light')}
                  className="px-2 py-1 bg-card-theme border border-theme rounded text-[11px] text-theme-primary hover:border-olive-primary transition-colors"
                >
                  Streetlight
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('drain')}
                  className="px-2 py-1 bg-card-theme border border-theme rounded text-[11px] text-theme-primary hover:border-olive-primary transition-colors"
                >
                  Open Drain
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block font-semibold text-theme-primary mb-1">
                Problem Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Large pothole near Tilak Nagar Main Road"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-theme rounded-lg bg-card-theme text-theme-primary focus:border-olive-primary focus:outline-hidden"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold text-theme-primary mb-1">
                Description
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe the nature of the infrastructure defect, hazards for motorists or pedestrians..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-theme rounded-lg bg-card-theme text-theme-primary focus:border-olive-primary focus:outline-hidden"
              />
            </div>

            {/* Image upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block font-semibold text-theme-primary mb-1">
                  Upload Defect Photo
                </label>
                <div className="border border-dashed border-theme rounded-xl p-3 text-center hover:bg-surface cursor-pointer relative theme-transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Camera className="w-5 h-5 text-theme-muted mx-auto mb-1" />
                  <span className="text-theme-secondary block font-medium">Click to select photo</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-theme-primary mb-1">
                  Preview
                </label>
                <div className="w-full h-20 bg-surface rounded-xl overflow-hidden border border-theme flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[11px] text-theme-muted">No image selected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Location selector */}
            <div className="p-3 bg-surface border border-theme rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-theme-primary flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-olive-primary" /> Location & Ward
                </span>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="text-[11px] flex items-center gap-1 text-olive-primary hover:underline font-medium"
                >
                  <Navigation className="w-3 h-3" />
                  Use My Current Location
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-theme-muted block mb-0.5">Locality / Block</label>
                  <select
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    className="w-full py-1.5 px-2 bg-card-theme border border-theme rounded font-medium text-theme-primary focus:outline-hidden"
                  >
                    <option value="Tilak Nagar">Tilak Nagar (Zone 7, Ward 46)</option>
                    <option value="Vijay Nagar">Vijay Nagar (Zone 8, Ward 49)</option>
                    <option value="Palasia">Palasia (Zone 5, Ward 38)</option>
                    <option value="Bhawarkua">Bhawarkua (Zone 8, Ward 52)</option>
                    <option value="Rau">Rau (Zone 11, Ward 68)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-theme-muted block mb-0.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full py-1.5 px-2 bg-card-theme border border-theme rounded font-medium text-theme-primary focus:outline-hidden"
                  >
                    <option value="AI_DETECT">✨ Let AI detect category</option>
                    <option value="Pothole">Pothole</option>
                    <option value="Road">Road</option>
                    <option value="Streetlight">Streetlight</option>
                    <option value="Drainage">Drainage</option>
                    <option value="Garbage">Garbage</option>
                    <option value="Water">Water</option>
                    <option value="Footpath">Footpath</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-theme">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-medium text-theme-muted hover:text-theme-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-olive-primary hover:bg-olive-dark text-white font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Submit Problem & Analyze with AI</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
