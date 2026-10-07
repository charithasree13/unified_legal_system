import React, { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, Filter, X, ChevronRight, Scale, Info, FileText, Sparkles, Layers, ArrowLeft, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getApiUrl } from '../config/api';

export interface DictionaryEntry {
  id: string;
  category: string;
  term: string;
  definition: string;
  additionalInformation?: string;
  examples?: string[];
  notes?: string[];
  relatedTerms?: string[];
  createdBy?: string;
  createdAt?: string;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const ITEMS_PER_PAGE = 50;

export const LegalDictionary: React.FC = () => {
  const { user, token, addNotification } = useAuthStore();
  const isAdmin = user?.role === 'Admin';

  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedLetter, setSelectedLetter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Add Term Modal States (Admin Only)
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newTerm, setNewTerm] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [newDefinition, setNewDefinition] = useState<string>('');
  const [newAdditionalInfo, setNewAdditionalInfo] = useState<string>('');
  const [newExamples, setNewExamples] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [newRelatedTerms, setNewRelatedTerms] = useState<string>('');
  const [addLoading, setAddLoading] = useState<boolean>(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // Fetch protected dictionary data from backend API
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(getApiUrl('/api/dictionary'), {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Access Denied: You do not have permission to view the Legal Dictionary.");
        }
        if (!res.ok) {
          throw new Error(`Failed to load dictionary data: HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data: any) => {
        if (isMounted) {
          const list: DictionaryEntry[] = Array.isArray(data) ? data : (data.entries || data.data || []);
          const sanitized = list
            .map(item => {
              const raw = item.term || '';
              const cleaned = raw.replace(/^\d+[\s\.\-\:\)\'\"]*/, '').trim();
              const termStr = cleaned.length > 0 ? (cleaned.charAt(0).toUpperCase() + cleaned.slice(1)) : '';
              return { ...item, term: termStr };
            })
            .filter(item => item.term && item.term.trim().length > 0 && !/^\d+$/.test(item.term.trim()));
          setEntries(sanitized);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error("Error loading legal dictionary:", err);
          setError(err.message || "Unable to load legal dictionary static data. Please try again later.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleAddTermSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddSuccess(null);

    const termVal = newTerm.trim();
    const catVal = (newCategory === 'NEW_CATEGORY' ? customCategory : newCategory).trim();
    const defVal = newDefinition.trim();

    if (!termVal) {
      setAddError('Word / Legal Term is required.');
      return;
    }
    if (!catVal) {
      setAddError('Category is required.');
      return;
    }
    if (!defVal) {
      setAddError('Meaning / Definition is required.');
      return;
    }

    setAddLoading(true);

    try {
      const res = await fetch(getApiUrl('/api/dictionary'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          term: termVal,
          category: catVal,
          definition: defVal,
          additionalInformation: newAdditionalInfo.trim(),
          examples: newExamples.trim() ? newExamples.split('\n').map(s => s.trim()).filter(Boolean) : [],
          notes: newNotes.trim() ? newNotes.split('\n').map(s => s.trim()).filter(Boolean) : [],
          relatedTerms: newRelatedTerms.trim() ? newRelatedTerms.split(',').map(s => s.trim()).filter(Boolean) : []
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save new legal term.');
      }

      const addedEntry: DictionaryEntry = data.entry;
      setEntries(prev => [addedEntry, ...prev]);
      setAddSuccess('Legal term added successfully!');

      if (addNotification) {
        addNotification('Success', `Legal term "${addedEntry.term}" added successfully.`, 'success');
      }

      // Reset form
      setNewTerm('');
      setNewCategory('');
      setCustomCategory('');
      setNewDefinition('');
      setNewAdditionalInfo('');
      setNewExamples('');
      setNewNotes('');
      setNewRelatedTerms('');

      setTimeout(() => {
        setIsAddModalOpen(false);
        setAddSuccess(null);
      }, 1000);

    } catch (err: any) {
      console.error("Add term error:", err);
      setAddError(err.message || 'Failed to add legal term.');
    } finally {
      setAddLoading(false);
    }
  };

  // Dynamically extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    entries.forEach(e => {
      if (e.category) set.add(e.category);
    });
    return Array.from(set).sort();
  }, [entries]);

  // Compute available letters for current category filter
  const availableLetters = useMemo(() => {
    const lettersSet = new Set<string>();
    entries.forEach(e => {
      if (selectedCategory === 'All Categories' || e.category === selectedCategory) {
        const firstChar = e.term.trim().charAt(0).toUpperCase();
        if (/[A-Z]/.test(firstChar)) {
          lettersSet.add(firstChar);
        }
      }
    });
    return lettersSet;
  }, [entries, selectedCategory]);

  // Filter & Sort entries programmatically (case-insensitive alphabetical order)
  const filteredEntries = useMemo(() => {
    let result = entries;

    // 1. Category Filter
    if (selectedCategory !== 'All Categories') {
      result = result.filter(e => e.category === selectedCategory);
    }

    // 2. A-Z Letter Filter
    if (selectedLetter !== 'All') {
      result = result.filter(e => {
        const firstChar = e.term.trim().charAt(0).toUpperCase();
        return firstChar === selectedLetter;
      });
    }

    // 3. Search Query Filter (term, definition, additional info)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(e => 
        e.term.toLowerCase().includes(q) ||
        e.definition.toLowerCase().includes(q) ||
        (e.additionalInformation && e.additionalInformation.toLowerCase().includes(q))
      );
    }

    // 4. Programmatic Case-Insensitive Alphabetical Sorting
    return [...result].sort((a, b) => a.term.localeCompare(b.term, undefined, { sensitivity: 'base' }));
  }, [entries, selectedCategory, selectedLetter, searchQuery]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedLetter, searchQuery]);

  // Paginated visible entries
  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEntries.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEntries, currentPage]);

  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);

  // Clear all filters
  const handleResetFilters = () => {
    setSelectedCategory('All Categories');
    setSelectedLetter('All');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 dark:bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary dark:bg-sky-500/20 dark:text-sky-300 text-xs font-semibold uppercase tracking-wider">
                <BookOpen size={14} />
                LEGAL REFERENCE
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                LEGAL DICTIONARY
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                Browse legal terminology, Latin maxims, Islamic legal terms, land revenue records, and domain glossaries by category and alphabetical order.
              </p>
            </div>

            {/* Right side controls: Stat counter & Admin Add Button */}
            <div className="flex flex-wrap items-center gap-4 flex-shrink-0">
              {isAdmin && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus size={16} />
                  Add Legal Term
                </button>
              )}

              <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 flex-shrink-0">
                <div className="p-3 bg-primary/10 text-primary dark:bg-sky-500/20 dark:text-sky-400 rounded-lg">
                  <Scale size={24} />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {entries.length.toLocaleString()}
                  </div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Total Terms in {categories.length} Categories
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Main Controls Bar */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Search Box */}
            <div className="md:col-span-7 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search legal terms, definitions, maxims..."
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
              <Search size={18} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="md:col-span-5 relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2.5 pl-3 pr-8 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-500 text-slate-900 dark:text-slate-100 cursor-pointer font-medium"
              >
                <option value="All Categories">All Categories ({entries.length.toLocaleString()})</option>
                {categories.map(cat => {
                  const catCount = entries.filter(e => e.category === cat).length;
                  return (
                    <option key={cat} value={cat}>
                      {cat} ({catCount})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* A-Z Alphabet Navigation Bar */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
              <button
                onClick={() => setSelectedLetter('All')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex-shrink-0 ${
                  selectedLetter === 'All'
                    ? 'bg-primary text-white dark:bg-sky-500 dark:text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                ALL
              </button>

              {ALPHABET.map(letter => {
                const isAvailable = availableLetters.has(letter);
                const isSelected = selectedLetter === letter;
                return (
                  <button
                    key={letter}
                    disabled={!isAvailable}
                    onClick={() => setSelectedLetter(letter)}
                    className={`min-w-[32px] h-8 px-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'bg-primary text-white dark:bg-sky-500 dark:text-slate-950 shadow-xs'
                        : isAvailable
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer'
                        : 'bg-slate-100/50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
                    }`}

                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-2">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span>Showing <strong className="text-slate-900 dark:text-white font-bold">{filteredEntries.length.toLocaleString()}</strong> results</span>
            {selectedCategory !== 'All Categories' && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary dark:bg-sky-500/20 dark:text-sky-300 px-2.5 py-0.5 rounded-full text-xs font-medium">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('All Categories')} className="hover:text-red-500 ml-1"><X size={12} /></button>
              </span>
            )}
            {selectedLetter !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 px-2.5 py-0.5 rounded-full text-xs font-medium">
                Letter: {selectedLetter}
                <button onClick={() => setSelectedLetter('All')} className="hover:text-red-500 ml-1"><X size={12} /></button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 px-2.5 py-0.5 rounded-full text-xs font-medium">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-red-500 ml-1"><X size={12} /></button>
              </span>
            )}
          </div>

          {(selectedCategory !== 'All Categories' || selectedLetter !== 'All' || searchQuery) && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-primary dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary dark:border-sky-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Loading Legal Dictionary...</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Processing static dictionary dataset...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-2xl p-6 text-center text-red-700 dark:text-red-300">
            <Info className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* No Results State */}
        {!loading && !error && filteredEntries.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-xs">
            <BookOpen className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Legal Terms Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              No dictionary entries matched your filter criteria. Try adjusting your search query, category selection, or letter filter.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 bg-primary text-white dark:bg-sky-500 dark:text-slate-950 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Entry Grid / Cards */}
        {!loading && !error && filteredEntries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedEntries.map(entry => (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-primary/50 dark:hover:border-sky-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-sky-400 transition-colors leading-snug">
                      {entry.term}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                      {entry.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {entry.definition}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-primary dark:text-sky-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Read Complete Definition</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && !error && totalPages > 1 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Page <strong className="text-slate-900 dark:text-white">{currentPage}</strong> of <strong className="text-slate-900 dark:text-white">{totalPages}</strong> (showing {paginatedEntries.length} items)
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Previous
              </button>
              
              <span className="text-xs font-bold px-2 text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Complete Word Detail Modal / Modal View */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 relative">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:bg-sky-500/20 dark:text-sky-300 mb-2">
                  {selectedEntry.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  {selectedEntry.term}
                </h2>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Complete Definition */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Complete Definition
              </h4>
              <div className="text-base sm:text-lg text-slate-800 dark:text-slate-100 leading-relaxed font-sans whitespace-pre-line bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                {selectedEntry.definition}
              </div>
            </div>

            {/* Additional Information (if present) */}
            {selectedEntry.additionalInformation && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Additional Information
                </h4>
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                  {selectedEntry.additionalInformation}
                </div>
              </div>
            )}

            {/* Examples (if present) */}
            {selectedEntry.examples && selectedEntry.examples.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Examples
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  {selectedEntry.examples.map((ex, i) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related Terms (if present) */}
            {selectedEntry.relatedTerms && selectedEntry.relatedTerms.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Related Terms
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEntry.relatedTerms.map((rt, i) => (
                    <span key={i} className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg font-medium">
                      {rt}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Admin Add Legal Term Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-5 relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <BookOpen size={20} className="text-amber-500" />
                <h3 className="text-lg font-bold">Add New Legal Term</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {addError && (
              <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                <Info size={16} className="flex-shrink-0 text-red-500" />
                <span>{addError}</span>
              </div>
            )}

            {addSuccess && (
              <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-3.5 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Sparkles size={16} className="flex-shrink-0 text-emerald-500" />
                <span>{addSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddTermSubmit} className="space-y-4 text-xs">
              {/* Term / Word */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Word / Legal Term <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  placeholder="e.g. Res Judicata, Mandamus, Coparcenary"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white mb-2"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="NEW_CATEGORY">+ Create New Category...</option>
                </select>

                {(newCategory === 'NEW_CATEGORY' || categories.length === 0) && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter new category name..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                  />
                )}
              </div>

              {/* Definition / Meaning */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Meaning / Definition <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={newDefinition}
                  onChange={(e) => setNewDefinition(e.target.value)}
                  placeholder="Enter full legal definition..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Additional Info */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Additional Information / Explanation (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newAdditionalInfo}
                  onChange={(e) => setNewAdditionalInfo(e.target.value)}
                  placeholder="Statutory context, case citations, or notes..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Examples */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Examples (Optional, one per line)
                </label>
                <textarea
                  rows={2}
                  value={newExamples}
                  onChange={(e) => setNewExamples(e.target.value)}
                  placeholder="Example 1&#10;Example 2"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Related Terms */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Related Terms (Optional, comma separated)
                </label>
                <input
                  type="text"
                  value={newRelatedTerms}
                  onChange={(e) => setNewRelatedTerms(e.target.value)}
                  placeholder="e.g. Stare Decisis, Ratio Decidendi"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl disabled:opacity-50 transition-colors"
                >
                  {addLoading ? 'Saving...' : 'Save Legal Term'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};
