import React, { useState } from 'react';
import { useCivic } from '../../context/CivicContext';
import { UserProfile } from '../../types';
import { MapPin, Navigation, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CitizenSetupModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { loginWithProfile, showToast } = useCivic();

  const [formData, setFormData] = useState({
    name: 'Amit Verma',
    email: 'amit.verma@indorecitizen.in',
    phone: '+91 98260 41299',
    district: 'Indore',
    city: 'Indore',
    zone: '7',
    ward: '46',
    block: 'Tilak Nagar',
    address: 'Tilak Nagar Sector B',
  });

  const [locating, setLocating] = useState(false);

  if (!isOpen) return null;

  const handleUseLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocating(false);
          setFormData((prev) => ({
            ...prev,
            district: 'Indore',
            city: 'Indore',
            block: 'Tilak Nagar',
            zone: '7',
            ward: '46',
            address: `GPS Pin: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (Tilak Nagar)`,
          }));
          showToast('GPS coordinates acquired: Tilak Nagar, Zone 7, Indore', 'success');
        },
        () => {
          setLocating(false);
          setFormData((prev) => ({
            ...prev,
            district: 'Indore',
            city: 'Indore',
            block: 'Tilak Nagar',
            zone: '7',
            ward: '46',
          }));
          showToast('Location coordinates set for Tilak Nagar, Indore', 'info');
        },
        { timeout: 4000 }
      );
    } else {
      setLocating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProfile: UserProfile = {
      id: `usr_citizen_${Date.now()}`,
      role: 'citizen',
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      district: formData.district,
      city: formData.city,
      zone: formData.zone,
      ward: formData.ward,
      block: formData.block,
      address: formData.address,
    };
    loginWithProfile(newProfile);
    onClose();
  };

  const indoreLocalities = [
    { name: 'Tilak Nagar', zone: '7', ward: '46' },
    { name: 'Vijay Nagar', zone: '8', ward: '49' },
    { name: 'Palasia', zone: '5', ward: '38' },
    { name: 'Bhawarkua', zone: '8', ward: '52' },
    { name: 'Rau', zone: '11', ward: '68' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-card-theme rounded-2xl max-w-lg w-full border border-theme shadow-xl overflow-hidden my-8 animate-fade-in">
        <div className="p-6 border-b border-theme flex items-center justify-between bg-surface">
          <div>
            <h3 className="text-base font-bold text-theme-primary">Citizen Profile Setup</h3>
            <p className="text-xs text-theme-muted mt-0.5">
              Connect your account to your residential municipal area
            </p>
          </div>
          <button onClick={onClose} className="text-theme-muted hover:text-theme-primary p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-theme-secondary mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-theme rounded-lg bg-card-theme text-theme-primary focus:border-olive-primary focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-theme-secondary mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-theme rounded-lg bg-card-theme text-theme-primary focus:border-olive-primary focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-secondary mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-theme rounded-lg bg-card-theme text-theme-primary focus:border-olive-primary focus:outline-hidden"
            />
          </div>

          <div className="p-3.5 bg-surface border border-theme rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-theme-primary flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-olive-primary" /> Geographic Ward
              </span>
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={locating}
                className="text-[11px] flex items-center gap-1 px-2.5 py-1 bg-card-theme border border-theme rounded-md text-theme-secondary hover:text-theme-primary font-medium"
              >
                <Navigation className="w-3 h-3 text-olive-primary" />
                {locating ? 'Locating...' : 'Use My Current Location'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-theme-muted mb-0.5">District / City</label>
                <input
                  type="text"
                  readOnly
                  value="Indore, Madhya Pradesh"
                  className="w-full text-xs px-2.5 py-1.5 bg-card-theme border border-theme rounded text-theme-secondary font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] text-theme-muted mb-0.5">Locality / Block</label>
                <select
                  value={formData.block}
                  onChange={(e) => {
                    const sel = indoreLocalities.find((l) => l.name === e.target.value);
                    setFormData({
                      ...formData,
                      block: e.target.value,
                      zone: sel?.zone || '7',
                      ward: sel?.ward || '46',
                    });
                  }}
                  className="w-full text-xs px-2.5 py-1.5 bg-card-theme border border-theme rounded font-medium text-theme-primary focus:outline-hidden"
                >
                  {indoreLocalities.map((loc) => (
                    <option key={loc.name} value={loc.name}>
                      {loc.name} (Zone {loc.zone}, Ward {loc.ward})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-theme-muted mb-0.5">Street Address / Landmark</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Near Goyal Hospital, Sector B"
                className="w-full text-xs px-3 py-1.5 bg-card-theme border border-theme rounded focus:border-olive-primary focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-theme-muted hover:text-theme-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-olive-primary text-white rounded-lg hover:bg-olive-dark transition-colors"
            >
              Save Profile & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
