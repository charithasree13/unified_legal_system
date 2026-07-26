import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Search, Filter, Star, Phone, Mail, Award, Landmark, MapPin, 
  Share2, ArrowUpDown, ShieldCheck, Download, Plus, X, AwardIcon
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import QRCode from 'qrcode';

export const Directory: React.FC = () => {
  const { token, user, addNotification } = useAuthStore();
  const [advocates, setAdvocates] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  
  // Search, filter, and sorting states
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [courtFilter, setCourtFilter] = useState('');
  const [practiceArea, setPracticeArea] = useState('');
  const [minExp, setMinExp] = useState('');
  const [sortBy, setSortBy] = useState('Recently Added');

  // Modal states
  const [selectedAdv, setSelectedAdv] = useState<any | null>(null);
  const [showQr, setShowQr] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // New Advocate Form Modal (Admin Only)
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [selectedCourts, setSelectedCourts] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', enrollmentNumber: '', enrollmentDate: '',
    specialization: '', court: '',
    city: '', state: '', experience: 1, bio: '', address: ''
  });
  
  const [formErr, setFormErr] = useState('');

  const handleSpecToggle = (spec: string) => {
    setSelectedSpecs(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const handleCourtToggle = (crt: string) => {
    setSelectedCourts(prev => 
      prev.includes(crt) ? prev.filter(c => c !== crt) : [...prev, crt]
    );
  };

  const openAddForm = () => {
    setFormData({
      name: '', phone: '', email: '', enrollmentNumber: '', enrollmentDate: '',
      specialization: '', court: '',
      city: '', state: '', experience: 1, bio: '', address: ''
    });
    setSelectedSpecs([]);
    setSelectedCourts([]);
    setFormErr('');
    setShowAddForm(true);
  };

  // Fetch directory list & localStorage favorites
  useEffect(() => {
    fetchDirectory();
    // Load bookmark list
    const favs = localStorage.getItem('legal_favorites');
    if (favs) setFavorites(JSON.parse(favs));
  }, [token, sortBy, stateFilter, courtFilter, practiceArea, minExp]);

  const fetchDirectory = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (stateFilter) queryParams.append('state', stateFilter);
      if (courtFilter) queryParams.append('court', courtFilter);
      if (practiceArea) queryParams.append('practiceArea', practiceArea);
      if (minExp) queryParams.append('minExperience', minExp);
      queryParams.append('sortBy', sortBy);

      const res = await fetch(`/api/advocates?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setAdvocates(data.advocates);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDirectory();
  };

  const handleToggleFavorite = (adv: any) => {
    let updatedFavs = [...favorites];
    const isFav = favorites.some((f) => f._id === adv._id);
    
    if (isFav) {
      updatedFavs = updatedFavs.filter((f) => f._id !== adv._id);
      addNotification('Favorite Removed', `${adv.name} removed from your favorites.`, 'info');
    } else {
      updatedFavs.push(adv);
      addNotification('Favorite Added', `${adv.name} added to your favorites list.`, 'success');
    }
    
    setFavorites(updatedFavs);
    localStorage.setItem('legal_favorites', JSON.stringify(updatedFavs));
  };

  // Generate styled canvas contact QR Code
  useEffect(() => {
    if (showQr && selectedAdv && qrCanvasRef.current) {
      const canvas = qrCanvasRef.current;
      
      // Build a standard vCard string containing the advocate's details
      const vCardText = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${selectedAdv.name}`,
        `TEL;TYPE=cell:${selectedAdv.phone || ''}`,
        `EMAIL;TYPE=internet:${selectedAdv.email || ''}`,
        `ORG:${selectedAdv.specialization || ''}`,
        `ADR;TYPE=work:;;${selectedAdv.address || ''};${selectedAdv.city || ''};${selectedAdv.state || ''};;`,
        `NOTE:Enrollment Number: ${selectedAdv.enrollmentNumber || ''} | Court: ${selectedAdv.court || ''} | Experience: ${selectedAdv.experience || 0} years`,
        'END:VCARD'
      ].join('\n');

      QRCode.toCanvas(
        canvas,
        vCardText,
        {
          width: 200,
          margin: 1.5,
          color: {
            dark: '#0F3D91', // Blue color theme
            light: '#FFFFFF'
          }
        },
        (error) => {
          if (error) {
            console.error('Error generating QR code:', error);
          }
        }
      );
    }
  }, [showQr, selectedAdv]);

  const handleExportContacts = () => {
    if (advocates.length === 0) return;
    
    // Convert to JSON file format
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(advocates, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", "advocate_contacts_export.json");
    document.body.appendChild(a);
    a.click();
    a.remove();
    
    addNotification('Contacts Exported', 'Directory contacts exported successfully.', 'success');
  };

  const handleAddAdvocate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');

    if (selectedSpecs.length === 0) {
      setFormErr('Please select at least one Specialization.');
      return;
    }
    if (selectedCourts.length === 0) {
      setFormErr('Please select at least one Practicing Court.');
      return;
    }

    const payload = {
      ...formData,
      specialization: selectedSpecs.join(', '),
      court: selectedCourts.join(', ')
    };

    try {
      const res = await fetch('/api/advocates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        setFormErr(data.message || 'Failed to add advocate.');
      } else {
        addNotification('Advocate Profile Added', 'A new advocate profile has been added.', 'success');
        setShowAddForm(false);
        setFormData({
          name: '', phone: '', email: '', enrollmentNumber: '', enrollmentDate: '',
          specialization: '', court: '',
          city: '', state: '', experience: 1, bio: '', address: ''
        });
        setSelectedSpecs([]);
        setSelectedCourts([]);
        fetchDirectory();
      }
    } catch (err) {
      setFormErr('Failed to establish server connection.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          
          {/* Main Search Input */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Name, City, Enrollment No, Specialization, Court..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          {/* Action Row */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
            >
              <option value="">State (All)</option>
              <optgroup label="States">
                <option>Andhra Pradesh</option>
                <option>Arunachal Pradesh</option>
                <option>Assam</option>
                <option>Bihar</option>
                <option>Chhattisgarh</option>
                <option>Goa</option>
                <option>Gujarat</option>
                <option>Haryana</option>
                <option>Himachal Pradesh</option>
                <option>Jharkhand</option>
                <option>Karnataka</option>
                <option>Kerala</option>
                <option>Madhya Pradesh</option>
                <option>Maharashtra</option>
                <option>Manipur</option>
                <option>Meghalaya</option>
                <option>Mizoram</option>
                <option>Nagaland</option>
                <option>Odisha</option>
                <option>Punjab</option>
                <option>Rajasthan</option>
                <option>Sikkim</option>
                <option>Tamil Nadu</option>
                <option>Telangana</option>
                <option>Tripura</option>
                <option>Uttarakhand</option>
                <option>Uttar Pradesh</option>
                <option>West Bengal</option>
              </optgroup>
              <optgroup label="Union Territories">
                <option>Andaman and Nicobar Islands</option>
                <option>Chandigarh</option>
                <option>Dadra and Nagar Haveli and Daman and Diu</option>
                <option>Delhi</option>
                <option>Jammu and Kashmir</option>
                <option>Ladakh</option>
                <option>Lakshadweep</option>
                <option>Puducherry</option>
              </optgroup>
            </select>

            <select
              value={courtFilter}
              onChange={(e) => setCourtFilter(e.target.value)}
              className="border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
            >
              <option value="">Court (All)</option>
              <option>Supreme Court of India</option>
              <option>High Court</option>
              <option>Senior civil judges court</option>
              <option>Junior civil Judges court</option>
              <option>Judicial magistrate of 1st class</option>
              <option>Consumers forum</option>
              <option>DRT</option>
            </select>

            <select
              value={practiceArea}
              onChange={(e) => setPracticeArea(e.target.value)}
              className="border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
            >
              <option value="">Specialization (All)</option>
              <option>Civil Litigation</option>
              <option>Criminal Defense</option>
              <option>Corporate Law</option>
              <option>Taxation Law</option>
              <option>Intellectual Property</option>
              <option>Bank legal advisors</option>
              <option>Notary</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none text-primary dark:text-sky-400 font-semibold"
            >
              <option>Recently Added</option>
              <option>Alphabetically</option>
              <option>Experience</option>
              <option>City</option>
            </select>

            {user?.role === 'Admin' && (
              <button
                type="button"
                onClick={openAddForm}
                className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={14} /> Add Advocate
              </button>
            )}

            <button
              type="button"
              onClick={handleExportContacts}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1"
              title="Export JSON Contacts"
            >
              <Download size={14} /> Export
            </button>
          </div>

        </form>
      </div>

      {/* Directory Grid */}
      {advocates.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400 max-w-lg mx-auto">
          <Users size={48} className="mx-auto text-slate-300 mb-3" />
          <h4 className="font-bold text-sm">No Advocates Found</h4>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search criteria or filters, or add a new advocate profile to the platform index.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advocates.map((adv) => {
            const isFav = favorites.some((f) => f._id === adv._id);
            return (
              <div 
                key={adv._id} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-slate-300/80 dark:hover:border-slate-700 transition-all duration-200"
              >
                {/* Header card info */}
                <div className="p-5">
                  <div className="flex justify-between items-start gap-4">
                    
                    {/* Bio avatar */}
                    <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-primary dark:text-sky-400 flex items-center justify-center font-bold text-xl border border-slate-200/50 dark:border-slate-700">
                      {adv.name.charAt(0)}
                    </div>
                    
                    {/* Star & Verification indicator */}
                    <div className="flex gap-2 items-center">
                      {adv.isVerified ? (
                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                          <ShieldCheck size={10} /> Verified
                        </span>
                      ) : (
                        <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                          Pending
                        </span>
                      )}
                      
                      <button 
                        onClick={() => handleToggleFavorite(adv)}
                        className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                          isFav ? 'text-amber-400' : 'text-slate-300'
                        }`}
                      >
                        <Star size={18} className={isFav ? 'fill-amber-400' : ''} />
                      </button>
                    </div>
                  </div>

                  {/* Body information */}
                  <div className="mt-4">
                    <h3 className="font-bold text-sm text-slate-950 dark:text-white">{adv.name}</h3>
                    <p className="text-xs text-primary dark:text-sky-400 font-semibold mt-0.5">{adv.specialization}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                      <Landmark size={12} /> {adv.court}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin size={12} /> {adv.city}, {adv.state}
                    </p>
                  </div>
                </div>

                {/* Footer details row */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-xs">
                  <span className="text-[10px] bg-primary/10 text-primary dark:bg-sky-400/20 dark:text-sky-400 px-2 py-0.5 rounded font-semibold">
                    {adv.experience} Years Exp
                  </span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSelectedAdv(adv); setShowQr(false); }}
                      className="text-xs text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-sky-400 font-bold hover:underline"
                    >
                      View Details
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Profile Details Modal */}
      {selectedAdv && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-slide-up relative">
            
            {/* Modal Header Banner */}
            <div className="h-20 bg-primary dark:bg-slate-850 flex justify-between items-center px-6 text-white">
              <h3 className="font-bold text-base">Advocate Credentials Card</h3>
              <button 
                onClick={() => setSelectedAdv(null)}
                className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Avatar Card */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="h-16 w-16 rounded-2xl bg-secondary text-primary font-bold text-3xl flex items-center justify-center shadow-inner">
                  {selectedAdv.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-1.5">
                    {selectedAdv.name}
                    {selectedAdv.isVerified && <ShieldCheck size={18} className="text-emerald-500" />}
                  </h3>
                  <p className="text-xs text-primary dark:text-sky-400 font-semibold">{selectedAdv.specialization}</p>
                  <p className="text-[11px] text-slate-400">Enrollment Date: {selectedAdv.enrollmentDate}</p>
                </div>
              </div>

              {/* QR Panel Toggler */}
              {showQr ? (
                <div className="text-center py-4 space-y-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-850">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">QR Contact Share Card</h4>
                  <canvas ref={qrCanvasRef} width={200} height={200} className="mx-auto bg-white p-2.5 rounded-lg shadow-sm border border-slate-200/50" />
                  <button 
                    onClick={() => setShowQr(false)}
                    className="text-xs text-primary dark:text-sky-400 font-bold hover:underline"
                  >
                    Back to Profile Details
                  </button>
                </div>
              ) : (
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Enrollment Number</span>
                      <span className="font-semibold">{selectedAdv.enrollmentNumber}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Experience</span>
                      <span className="font-semibold">{selectedAdv.experience} Years of Practice</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Practicing Court</span>
                      <span className="font-semibold flex items-center gap-1">
                        <Landmark size={12} className="text-slate-400" /> {selectedAdv.court}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Practicing City</span>
                      <span className="font-semibold flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" /> {selectedAdv.city}, {selectedAdv.state}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Phone Contact</span>
                      <span className="font-semibold flex items-center gap-1">
                        <Phone size={12} className="text-slate-400" /> {selectedAdv.phone}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Email Address</span>
                      <span className="font-semibold flex items-center gap-1 text-primary dark:text-sky-400">
                        <Mail size={12} className="text-slate-400" /> {selectedAdv.email}
                      </span>
                    </div>
                  </div>

                  {selectedAdv.address && (
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Office Address</span>
                      <span className="text-slate-600 dark:text-slate-350">{selectedAdv.address}</span>
                    </div>
                  )}

                  {selectedAdv.bio && (
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Bio / Background</span>
                      <p className="text-slate-500 dark:text-slate-400 text-justify">{selectedAdv.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-2">
              <button
                onClick={() => setShowQr(!showQr)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-200/50 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400"
              >
                <Share2 size={14} /> {showQr ? 'Hide Contact QR' : 'Share QR Code'}
              </button>

              <button
                onClick={() => setSelectedAdv(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Admin Add Advocate Profile Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden animate-slide-up relative">
            
            <div className="h-16 bg-primary flex justify-between items-center px-6 text-white">
              <h3 className="font-bold text-base">Index New Advocate Profile</h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddAdvocate} className="p-6 space-y-4">
              {formErr && <p className="text-xs text-red-500 font-semibold">{formErr}</p>}
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Advocate Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    placeholder="Advocate Name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Enrollment Number</label>
                  <input
                    type="text"
                    value={formData.enrollmentNumber}
                    onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                    required
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    placeholder="e.g. BAR/DEL/123/2015"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    maxLength={10}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    placeholder="10 digit number"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    placeholder="email@court.org"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Enrollment Date</label>
                  <input
                    type="date"
                    value={formData.enrollmentDate}
                    onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                    required
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Specialization(s)</label>
                  <div className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs bg-slate-50 dark:bg-slate-950 max-h-[110px] overflow-y-auto space-y-1.5 scrollbar-thin">
                    {['Civil Litigation', 'Criminal Defense', 'Corporate Law', 'Taxation Law', 'Intellectual Property', 'Bank legal advisors', 'Notary'].map((spec) => (
                      <label key={spec} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:text-primary transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedSpecs.includes(spec)}
                          onChange={() => handleSpecToggle(spec)}
                          className="rounded border-slate-300 text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                        {spec}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Practicing Court(s)</label>
                  <div className="w-full mt-1 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs bg-slate-50 dark:bg-slate-950 max-h-[110px] overflow-y-auto space-y-1.5 scrollbar-thin">
                    {['Supreme Court of India', 'High Court', 'Senior civil judges court', 'Junior civil Judges court', 'Judicial magistrate of 1st class', 'Consumers forum', 'DRT'].map((crt) => (
                      <label key={crt} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:text-primary transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedCourts.includes(crt)}
                          onChange={() => handleCourtToggle(crt)}
                          className="rounded border-slate-300 text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                        {crt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase">Experience (Years)</label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
                  required
                  min={0}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    placeholder="New Delhi"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                    className="w-full mt-1 border border-slate-200 dark:border-slate-855 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  >
                    <option value="">Select State / UT</option>
                    <optgroup label="States">
                      <option>Andhra Pradesh</option>
                      <option>Arunachal Pradesh</option>
                      <option>Assam</option>
                      <option>Bihar</option>
                      <option>Chhattisgarh</option>
                      <option>Goa</option>
                      <option>Gujarat</option>
                      <option>Haryana</option>
                      <option>Himachal Pradesh</option>
                      <option>Jharkhand</option>
                      <option>Karnataka</option>
                      <option>Kerala</option>
                      <option>Madhya Pradesh</option>
                      <option>Maharashtra</option>
                      <option>Manipur</option>
                      <option>Meghalaya</option>
                      <option>Mizoram</option>
                      <option>Nagaland</option>
                      <option>Odisha</option>
                      <option>Punjab</option>
                      <option>Rajasthan</option>
                      <option>Sikkim</option>
                      <option>Tamil Nadu</option>
                      <option>Telangana</option>
                      <option>Tripura</option>
                      <option>Uttarakhand</option>
                      <option>Uttar Pradesh</option>
                      <option>West Bengal</option>
                    </optgroup>
                    <optgroup label="Union Territories">
                      <option>Andaman and Nicobar Islands</option>
                      <option>Chandigarh</option>
                      <option>Dadra and Nagar Haveli and Daman and Diu</option>
                      <option>Delhi</option>
                      <option>Jammu and Kashmir</option>
                      <option>Ladakh</option>
                      <option>Lakshadweep</option>
                      <option>Puducherry</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase">Office Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  placeholder="e.g. Chamber 456, High Court Chambers"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase">Professional Biography</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none h-16"
                  placeholder="Practices primarily in Constitutional and Corporate litigation..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Publish Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
