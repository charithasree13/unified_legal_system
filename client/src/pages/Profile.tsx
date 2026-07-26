import React, { useState } from 'react';
import { User, Phone, Mail, Award, Landmark, MapPin, CheckCircle, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Profile: React.FC = () => {
  const { user, updateUserProfile, addNotification } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photo, setPhoto] = useState(user?.profilePhoto || '');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    // Simulate database update delay
    setTimeout(() => {
      updateUserProfile({ name, phone, email, profilePhoto: photo });
      setLoading(false);
      setMsg('Profile credentials updated successfully.');
      addNotification('Profile Updated', 'Your user profile details have been saved.', 'success');
    }, 1000);
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden animate-slide-up">
      <div className="h-24 bg-primary flex items-center justify-between px-6 text-white">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <User size={16} /> My Professional Profile
        </h3>
        <span className="text-[10px] bg-secondary/25 text-[#1e293b] dark:text-sky-400 px-3 py-0.5 rounded-full font-bold uppercase tracking-wider">
          {user?.role} Access
        </span>
      </div>

      <form onSubmit={handleUpdate} className="p-6 space-y-4 text-xs">
        {msg && (
          <p className="p-2.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-semibold rounded-lg">
            {msg}
          </p>
        )}

        <div className="flex gap-4 items-center border-b border-slate-100 dark:border-slate-850 pb-4">
          <div className="h-16 w-16 rounded-full bg-secondary text-primary font-bold text-2xl flex items-center justify-center border border-slate-200">
            {name.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{name || 'Counselor'}</h4>
            <p className="text-slate-400">{email}</p>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-500 uppercase">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-500 uppercase">Contact Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-500 uppercase">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled
              className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 bg-slate-100 dark:bg-slate-900 text-slate-450 focus:outline-none cursor-not-allowed"
            />
          </div>
        </div>

        {user?.role === 'Admin' && user.enrollmentYear && (
          <div>
            <label className="block font-semibold text-slate-500 uppercase">Advocate Enrollment Year</label>
            <input
              type="text"
              value={user.enrollmentYear}
              disabled
              className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 bg-slate-100 dark:bg-slate-900 text-slate-450 focus:outline-none cursor-not-allowed"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded text-xs font-semibold transition-all mt-2 cursor-pointer shadow"
        >
          {loading ? 'Saving Profile Updates...' : 'Update Profile Credentials'}
        </button>
      </form>
    </div>
  );
};
