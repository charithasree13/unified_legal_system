import React, { useState } from 'react';
import { Plus, X, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const SPECIALIZATIONS = [
  'Civil Litigation',
  'Criminal Defense',
  'Corporate Law',
  'Taxation Law',
  'Intellectual Property',
  'Bank legal advisors',
  'Notary',
  'AGP',
  'APP'
];

const PRACTICING_COURTS = [
  'Supreme Court of India',
  'High Court',
  'Senior civil judges court',
  'Junior civil Judges court',
  'Judicial magistrate of 1st class',
  'Consumers forum',
  'DRT'
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export const AdvocateOnboardingModal: React.FC = () => {
  const { user, token, updateUserProfile, addNotification } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [enrollmentNumber, setEnrollmentNumber] = useState(user?.enrollmentNumber || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [enrollmentDate, setEnrollmentDate] = useState('');
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(['Civil Litigation']);
  const [selectedCourts, setSelectedCourts] = useState<string[]>(['High Court']);
  const [experience, setExperience] = useState<number>(1);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setDismissed(true);
    addNotification('Notice', 'You can complete your advocate directory profile anytime.', 'info');
  };

  // Show modal only if user is an Advocate who hasn't completed profile onboarding and not dismissed
  if (dismissed || !user || user.role !== 'Advocate' || user.hasCompletedProfile === true) {
    return null;
  }

  const handleSpecToggle = (spec: string) => {
    setSelectedSpecs(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const handleCourtToggle = (court: string) => {
    setSelectedCourts(prev =>
      prev.includes(court) ? prev.filter(c => c !== court) : [...prev, court]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !phone.trim() || !email.trim() || !enrollmentNumber.trim() || !enrollmentDate || !city.trim() || !state) {
      setError('Please fill in all mandatory advocate profile details.');
      return;
    }

    if (selectedSpecs.length === 0) {
      setError('Please select at least one Specialization.');
      return;
    }

    if (selectedCourts.length === 0) {
      setError('Please select at least one Practicing Court.');
      return;
    }

    setLoading(true);

    const API_BASE = import.meta.env.VITE_API_URL || '';

    try {
      const response = await fetch(`${API_BASE}/api/advocates/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          enrollmentNumber: enrollmentNumber.trim(),
          phone: phone.trim(),
          email: email.trim(),
          enrollmentDate,
          specialization: selectedSpecs,
          court: selectedCourts,
          experience: Number(experience || 1),
          city: city.trim(),
          state,
          address: address.trim(),
          bio: bio.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        updateUserProfile({
          hasCompletedProfile: true,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          enrollmentNumber: enrollmentNumber.trim(),
          isVerified: false,
          verificationStatus: 'PENDING'
        });
        addNotification(
          'Registration Submitted',
          'Your Advocate registration has been submitted successfully and is pending Admin verification.',
          'info'
        );
      } else {
        setError(data.message || 'Failed to submit advocate directory profile.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Network error submitting advocate directory profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#171916]/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFDF8] dark:bg-[#171916] border border-[#D8D1C5] dark:border-[#30352F] rounded-xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-slide-up">
        
        {/* Modal Top Header Bar */}
        <div className="bg-[#183C32] dark:bg-[#171916] text-[#F4F0E7] px-5 py-3.5 flex justify-between items-center border-b border-[#A67C3B]/40">
          <div className="flex items-center gap-2 font-bold text-sm tracking-wide">
            <Plus size={18} className="stroke-[2.5]" />
            <span>Index New Advocate Profile</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Close Onboarding"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[calc(85vh-110px)] overflow-y-auto">
          
          {error && (
            <div className="p-3 bg-[#F1E2DF] dark:bg-[#38201D] border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg text-xs text-[#7A423B] dark:text-[#E5A8A0] flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Header Info Banner */}
          <div className="p-3.5 bg-[#F1E9D8] dark:bg-[#332A19] border border-[#D8D1C5] dark:border-[#3A4038] rounded-lg text-xs text-[#80632E] dark:text-[#D8C49A]">
            <p className="font-bold text-[#A67C3B] dark:text-[#C7A45A] text-sm flex items-center gap-1.5">
              ⚖️ Complete Advocate Registration & Verification Details
            </p>
            <p className="text-[11px] text-[#625F58] dark:text-[#C5C0B6] mt-1 leading-relaxed">
              Your Google / authentication account has been verified. Please provide your professional Advocate enrollment details below for Legal Administrator verification.
            </p>
          </div>

          {/* Row 1: Advocate Name & Enrollment Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide">Advocate Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full mt-1 border border-[#D8D1C5] dark:border-[#3A4038] rounded-md px-3 py-1.5 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7]"
                placeholder="Advocate Name"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide">Enrollment Number</label>
              <input
                type="text"
                value={enrollmentNumber}
                onChange={(e) => setEnrollmentNumber(e.target.value)}
                required
                className="w-full mt-1 border border-[#D8D1C5] dark:border-[#3A4038] rounded-md px-3 py-1.5 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7]"
                placeholder="e.g. BAR/DEL/123/2015"
              />
            </div>
          </div>

          {/* Row 2: Phone, Email & Enrollment Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full mt-1 border border-[#D8D1C5] dark:border-[#3A4038] rounded-md px-3 py-1.5 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7]"
                placeholder="10 digit number"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mt-1 border border-[#D8D1C5] dark:border-[#3A4038] rounded-md px-3 py-1.5 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7]"
                placeholder="email@court.org"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide">Enrollment Date</label>
              <input
                type="date"
                value={enrollmentDate}
                onChange={(e) => setEnrollmentDate(e.target.value)}
                required
                className="w-full mt-1 border border-[#D8D1C5] dark:border-[#3A4038] rounded-md px-3 py-1.5 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7]"
              />
            </div>
          </div>

          {/* Row 3: Specializations & Practicing Courts Checkbox Grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Specialization(s) */}
            <div>
              <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide mb-1">
                Specialization(s) (Select Multiple)
              </label>
              <div className="grid grid-cols-1 gap-1.5 p-3 bg-[#FFFDF8] dark:bg-[#1E211D] rounded-lg border border-[#D8D1C5] dark:border-[#3A4038] max-h-48 overflow-y-auto">
                {SPECIALIZATIONS.map((spec) => (
                  <label key={spec} className="flex items-center gap-2 text-xs text-[#242522] dark:text-[#F4F0E7] cursor-pointer hover:text-[#183C32] dark:hover:text-[#6F9A83] transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedSpecs.includes(spec)}
                      onChange={() => handleSpecToggle(spec)}
                      className="rounded border-[#D8D1C5] text-[#183C32] focus:ring-[#183C32]"
                    />
                    <span>{spec}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Practicing Court(s) */}
            <div>
              <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide mb-1">
                Practicing Court(s) (Select Multiple)
              </label>
              <div className="grid grid-cols-1 gap-1.5 p-3 bg-[#FFFDF8] dark:bg-[#1E211D] rounded-lg border border-[#D8D1C5] dark:border-[#3A4038] max-h-48 overflow-y-auto">
                {PRACTICING_COURTS.map((court) => (
                  <label key={court} className="flex items-center gap-2 text-xs text-[#242522] dark:text-[#F4F0E7] cursor-pointer hover:text-[#183C32] dark:hover:text-[#6F9A83] transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedCourts.includes(court)}
                      onChange={() => handleCourtToggle(court)}
                      className="rounded border-[#D8D1C5] text-[#183C32] focus:ring-[#183C32]"
                    />
                    <span>{court}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Row 4: Experience (Years) */}
          <div>
            <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide">Experience (Years)</label>
            <input
              type="number"
              min="0"
              max="60"
              value={experience}
              onChange={(e) => setExperience(Number(e.target.value))}
              required
              className="w-full mt-1 border border-[#D8D1C5] dark:border-[#3A4038] rounded-md px-3 py-1.5 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7]"
              placeholder="1"
            />
          </div>

          {/* Row 5: City & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full mt-1 border border-[#D8D1C5] dark:border-[#3A4038] rounded-md px-3 py-1.5 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7]"
                placeholder="New Delhi"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="w-full mt-1 border border-[#D8D1C5] dark:border-[#3A4038] rounded-md px-3 py-1.5 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7]"
              >
                <option value="">Select State / UT</option>
                {INDIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 6: Office Address */}
          <div>
            <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide">Office Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full mt-1 border border-[#D8D1C5] dark:border-[#3A4038] rounded-md px-3 py-1.5 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7]"
              placeholder="e.g. Chamber 456, High Court Chambers"
            />
          </div>

          {/* Row 7: Professional Biography */}
          <div>
            <label className="block text-[10px] font-bold text-[#858078] dark:text-[#969188] uppercase tracking-wide">Professional Biography</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full mt-1 border border-[#D8D1C5] dark:border-[#3A4038] rounded-md px-3 py-2 text-xs bg-[#FFFDF8] dark:bg-[#1E211D] focus:outline-none focus:border-[#183C32] text-[#242522] dark:text-[#F4F0E7] leading-relaxed"
              placeholder="Practices primarily in Constitutional and Corporate litigation..."
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#D8D1C5] dark:border-[#30352F]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-[#71877B] hover:bg-[#E7ECE5] dark:hover:bg-[#303930] text-[#183C32] dark:text-[#BFD4C7] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#183C32] hover:bg-[#245445] text-white dark:bg-[#6F9A83] dark:hover:bg-[#89AA98] dark:text-[#151815] rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Publishing Profile...' : 'Publish Profile'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
