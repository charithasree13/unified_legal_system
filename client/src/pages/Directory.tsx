import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Users, Search, Filter, Star, Phone, Mail, Award, Landmark, MapPin, 
  Share2, ArrowUpDown, ShieldCheck, Download, Plus, X, AwardIcon, Edit3, Trash2,
  BookOpen, ExternalLink
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import QRCode from 'qrcode';

export const Directory: React.FC = () => {
  const { token, user, addNotification } = useAuthStore();
  const location = useLocation();
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

  // Edit Advocate Modal (Admin Only)
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAdv, setEditingAdv] = useState<any | null>(null);
  const [selectedEditSpecs, setSelectedEditSpecs] = useState<string[]>([]);
  const [selectedEditCourts, setSelectedEditCourts] = useState<string[]>([]);
  const [editFormData, setEditFormData] = useState({
    name: '', phone: '', email: '', enrollmentNumber: '', enrollmentDate: '',
    specialization: '', court: '',
    city: '', state: '', experience: 1, bio: '', address: '', isVerified: true
  });
  const [editErr, setEditErr] = useState('');

  const handleEditSpecToggle = (spec: string) => {
    setSelectedEditSpecs(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const handleEditCourtToggle = (crt: string) => {
    setSelectedEditCourts(prev => 
      prev.includes(crt) ? prev.filter(c => c !== crt) : [...prev, crt]
    );
  };

  const openEditForm = (adv: any) => {
    setEditingAdv(adv);
    setEditFormData({
      name: adv.name || '',
      phone: adv.phone || '',
      email: adv.email || '',
      enrollmentNumber: adv.enrollmentNumber || '',
      enrollmentDate: adv.enrollmentDate || '',
      specialization: adv.specialization || '',
      court: adv.court || '',
      city: adv.city || '',
      state: adv.state || '',
      experience: adv.experience !== undefined ? adv.experience : 1,
      bio: adv.bio || '',
      address: adv.address || '',
      isVerified: adv.isVerified === true
    });

    const specs = adv.specialization ? adv.specialization.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const crts = adv.court ? adv.court.split(',').map((c: string) => c.trim()).filter(Boolean) : [];
    setSelectedEditSpecs(specs);
    setSelectedEditCourts(crts);
    setEditErr('');
    setShowEditForm(true);
  };

  const handleUpdateAdvocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdv) return;
    setEditErr('');

    if (selectedEditSpecs.length === 0) {
      setEditErr('Please select at least one Specialization.');
      return;
    }
    if (selectedEditCourts.length === 0) {
      setEditErr('Please select at least one Practicing Court.');
      return;
    }

    const payload = {
      ...editFormData,
      specialization: selectedEditSpecs.join(', '),
      court: selectedEditCourts.join(', ')
    };

    try {
      const res = await fetch(`/api/advocates/${editingAdv._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        setEditErr(data.message || 'Failed to update advocate profile.');
      } else {
        addNotification('Advocate Profile Updated', `Profile details for ${payload.name} updated successfully.`, 'success');
        setShowEditForm(false);
        setEditingAdv(null);
        if (selectedAdv?._id === editingAdv._id) {
          setSelectedAdv(data.advocate || { ...selectedAdv, ...payload });
        }
        fetchDirectory();
      }
    } catch (err) {
      setEditErr('Failed to establish server connection.');
    }
  };

  const handleDeleteAdvocate = async (adv: any) => {
    if (!adv || !adv._id) return;
    const confirmed = window.confirm(`Are you sure you want to permanently delete the advocate profile for "${adv.name}"?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/advocates/${adv._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (!res.ok) {
        addNotification('Delete Failed', data.message || 'Failed to delete advocate profile.', 'warning');
      } else {
        addNotification('Advocate Profile Deleted', `Advocate profile for "${adv.name}" deleted successfully.`, 'info');
        if (selectedAdv?._id === adv._id) setSelectedAdv(null);
        fetchDirectory();
      }
    } catch (err) {
      addNotification('Delete Error', 'Network error while attempting to delete advocate profile.', 'warning');
    }
  };

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

  // Sync URL search query if passed from global navbar (e.g. /directory?search=Prasad)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const querySearch = urlParams.get('search');
    if (querySearch !== null && querySearch !== search) {
      setSearch(querySearch);
    }
  }, [location.search]);

  // Fetch directory list & localStorage favorites
  useEffect(() => {
    fetchDirectory();
    // Load bookmark list
    const favs = localStorage.getItem('legal_favorites');
    if (favs) setFavorites(JSON.parse(favs));
  }, [token, sortBy, stateFilter, courtFilter, practiceArea, minExp, search]);

  const DEFAULT_ADVOCATE_FALLBACKS = [
    {
      _id: "6a6347b9c99cd4bf3bc1dcf7",
      name: "P V Prasad",
      phone: "9247253096",
      email: "pvprasadvmpl@gmail.com",
      enrollmentNumber: "AP/298/1998",
      enrollmentDate: "1998-03-05",
      specialization: "Civil Litigation, Notary, Bank legal advisors",
      court: "Senior civil judges court, Junior civil Judges court, Judicial magistrate of 1st class",
      city: "Madanapalle",
      state: "Andhra Pradesh",
      experience: 28,
      photo: "",
      bio: "Advocate, Notary, Bank Panel Advocate, Verification of legal title",
      address: "Vasavi Bhavan Street, Madanapalle",
      availability: "Available",
      isVerified: true
    },
    {
      _id: "6a829b5a896aca0a6a210779",
      name: "Bestha Sreenivasulu  Advocate",
      phone: "9441135084",
      email: "bsreenivasadv@gmail.com",
      enrollmentNumber: "AP/32/2008",
      enrollmentDate: "2008-01-24",
      specialization: "Civil Litigation",
      court: "Senior civil judges court",
      city: "Madanapalle",
      state: "Andhra Pradesh",
      experience: 16,
      photo: "",
      bio: "Verified legal practitioner registered with Bar Council.",
      address: "2-245-8-B-7, Madanapalle",
      availability: "Available",
      isVerified: true
    }
  ];

  const fetchDirectory = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (stateFilter) queryParams.append('state', stateFilter);
      if (courtFilter) queryParams.append('court', courtFilter);
      if (practiceArea) queryParams.append('practiceArea', practiceArea);
      if (minExp) queryParams.append('minExperience', minExp);
      queryParams.append('sortBy', sortBy);

      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/advocates?${queryParams.toString()}`, { headers });
      const data = await res.json();

      if (res.ok && Array.isArray(data.advocates) && data.advocates.length > 0) {
        setAdvocates(data.advocates);
      } else {
        setAdvocates(DEFAULT_ADVOCATE_FALLBACKS);
      }
    } catch (err) {
      console.error('Error fetching advocate directory:', err);
      setAdvocates(DEFAULT_ADVOCATE_FALLBACKS);
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

    if (!formData.name.trim() || !formData.enrollmentNumber.trim() || !formData.phone.trim() || !formData.email.trim()) {
      setFormErr('Please fill out Advocate Name, Enrollment Number, Phone, and Email.');
      return;
    }

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
      court: selectedCourts.join(', '),
      city: formData.city.trim() || 'National Practice',
      state: formData.state.trim() || 'All India',
      experience: Number(formData.experience || 1)
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

      let data: any = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        data = { message: `Server error (${res.status} ${res.statusText || 'Error'})` };
      }

      if (!res.ok) {
        setFormErr(data.message || 'Failed to add advocate.');
      } else {
        addNotification('Advocate Profile Published', 'Advocate profile has been added to the directory.', 'success');
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
    } catch (err: any) {
      console.error('Error adding advocate:', err);
      setFormErr(err?.message || 'Network error connecting to backend server.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Main Search Input for Advocates */}
          <div className="relative flex-1 min-w-[280px] md:min-w-[340px]">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search advocate by name, city, enrollment no, specialization..."
              className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-all text-slate-850 dark:text-slate-100 placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
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
              <option>AGP</option>
              <option>APP</option>
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
                  
                  <div className="flex gap-1.5 items-center">
                    {user?.role === 'Admin' && (
                      <>
                        <button
                          onClick={() => openEditForm(adv)}
                          className="px-2 py-1 text-[11px] bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/60 rounded font-semibold flex items-center gap-1 cursor-pointer transition-colors border border-sky-200/60 dark:border-sky-800/60"
                          title="Edit Advocate Details"
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAdvocate(adv)}
                          className="px-2 py-1 text-[11px] bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 rounded font-semibold flex items-center gap-1 cursor-pointer transition-colors border border-red-200/60 dark:border-red-800/60"
                          title="Delete Advocate Profile"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => { setSelectedAdv(adv); setShowQr(false); }}
                      className="text-xs text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-sky-400 font-bold hover:underline ml-1"
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

                  {/* Legal Section Mapping Reference Tool (Admin & Advocate Only) */}
                  {(user?.role === 'Admin' || user?.role === 'Advocate') && (
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1">
                        <BookOpen size={12} className="text-primary dark:text-sky-400" /> Statutory Section Mapping Reference
                      </span>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                            Cross-Reference Tool (IPC ↔ BNS, CrPC ↔ BNSS, IEA ↔ BSA)
                          </span>
                          <a
                            href="/section-mapping"
                            className="text-[11px] font-bold text-primary dark:text-sky-400 hover:underline flex items-center gap-0.5"
                          >
                            Open Mapping Tool <ExternalLink size={10} />
                          </a>
                        </div>
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            Source: External legal reference (Official Gazette of India)
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 font-semibold">
                            Statutory Reference
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowQr(!showQr)}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-200/50 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400"
                >
                  <Share2 size={14} /> {showQr ? 'Hide QR' : 'Share QR'}
                </button>

                {user?.role === 'Admin' && (
                  <>
                    <button
                      onClick={() => { const target = selectedAdv; setSelectedAdv(null); openEditForm(target); }}
                      className="px-3 py-1.5 bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 hover:bg-sky-100 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer border border-sky-200/60 dark:border-sky-800/60"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => { const target = selectedAdv; setSelectedAdv(null); handleDeleteAdvocate(target); }}
                      className="px-3 py-1.5 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer border border-red-200/60 dark:border-red-800/60"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setSelectedAdv(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Admin Add Advocate Profile Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-slide-up relative">
            
            <div className="h-14 bg-primary flex justify-between items-center px-6 text-white flex-shrink-0">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Plus size={18} /> Index New Advocate Profile
              </h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddAdvocate} className="flex-1 overflow-y-auto p-5 space-y-3.5 scrollbar-thin">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Specialization(s) (Select Multiple)</label>
                  <div className="grid grid-cols-1 gap-1.5 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                    {['Civil Litigation', 'Criminal Defense', 'Corporate Law', 'Taxation Law', 'Intellectual Property', 'Bank legal advisors', 'Notary', 'AGP', 'APP'].map((spec) => (
                      <label key={spec} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:text-primary transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedSpecs.includes(spec)}
                          onChange={() => handleSpecToggle(spec)}
                          className="rounded border-slate-300 text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                        />
                        <span>{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Practicing Court(s) (Select Multiple)</label>
                  <div className="grid grid-cols-1 gap-1.5 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                    {['Supreme Court of India', 'High Court', 'Senior civil judges court', 'Junior civil Judges court', 'Judicial magistrate of 1st class', 'Consumers forum', 'DRT'].map((crt) => (
                      <label key={crt} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:text-primary transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedCourts.includes(crt)}
                          onChange={() => handleCourtToggle(crt)}
                          className="rounded border-slate-300 text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                        />
                        <span>{crt}</span>
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

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-850 mt-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold cursor-pointer shadow"
                >
                  Publish Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Edit Advocate Profile Modal */}
      {showEditForm && editingAdv && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-slide-up relative">
            
            <div className="h-14 bg-sky-600 dark:bg-sky-700 flex justify-between items-center px-6 text-white flex-shrink-0">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Edit3 size={18} /> Edit Advocate Profile Details
              </h3>
              <button 
                onClick={() => { setShowEditForm(false); setEditingAdv(null); }}
                className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateAdvocate} className="flex-1 overflow-y-auto p-5 space-y-3.5 scrollbar-thin">
              {editErr && <p className="text-xs text-red-500 font-semibold">{editErr}</p>}
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Advocate Name</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none font-semibold text-slate-800 dark:text-slate-200"
                    placeholder="Advocate Name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Enrollment Number</label>
                  <input
                    type="text"
                    value={editFormData.enrollmentNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, enrollmentNumber: e.target.value })}
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
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
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
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    required
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    placeholder="email@court.org"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Enrollment Date</label>
                  <input
                    type="date"
                    value={editFormData.enrollmentDate}
                    onChange={(e) => setEditFormData({ ...editFormData, enrollmentDate: e.target.value })}
                    required
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Specialization(s) (Select Multiple)</label>
                  <div className="grid grid-cols-1 gap-1.5 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                    {['Civil Litigation', 'Criminal Defense', 'Corporate Law', 'Taxation Law', 'Intellectual Property', 'Bank legal advisors', 'Notary', 'AGP', 'APP'].map((spec) => (
                      <label key={spec} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:text-primary transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedEditSpecs.includes(spec)}
                          onChange={() => handleEditSpecToggle(spec)}
                          className="rounded border-slate-300 text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                        />
                        <span>{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Practicing Court(s) (Select Multiple)</label>
                  <div className="grid grid-cols-1 gap-1.5 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                    {['Supreme Court of India', 'High Court', 'Senior civil judges court', 'Junior civil Judges court', 'Judicial magistrate of 1st class', 'Consumers forum', 'DRT'].map((crt) => (
                      <label key={crt} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:text-primary transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedEditCourts.includes(crt)}
                          onChange={() => handleEditCourtToggle(crt)}
                          className="rounded border-slate-300 text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                        />
                        <span>{crt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Experience (Years)</label>
                  <input
                    type="number"
                    value={editFormData.experience}
                    onChange={(e) => setEditFormData({ ...editFormData, experience: Number(e.target.value) })}
                    required
                    min={0}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Verification Status</label>
                  <select
                    value={editFormData.isVerified ? 'true' : 'false'}
                    onChange={(e) => setEditFormData({ ...editFormData, isVerified: e.target.value === 'true' })}
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  >
                    <option value="true">Verified Credentials</option>
                    <option value="false">Pending Verification</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">City</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    required
                    className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">State</label>
                  <select
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
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
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  placeholder="e.g. Chamber 456, High Court Chambers"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase">Professional Biography</label>
                <textarea
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  className="w-full mt-1 border border-slate-200 dark:border-slate-850 rounded px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none h-16"
                  placeholder="Practices primarily in Constitutional and Corporate litigation..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-850 mt-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => { setShowEditForm(false); setEditingAdv(null); }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow"
                >
                  Save & Update Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
