import React, { useState, useEffect, useMemo } from 'react';
import { 
  Link2, Plus, Search, Edit3, Trash2, X, ArrowLeft, 
  ExternalLink, AlertCircle, CheckCircle2, ShieldAlert,
  Sparkles, Globe, Folder, RefreshCw, BookmarkCheck
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getApiUrl } from '../config/api';

export interface UsefulLinkItem {
  _id: string;
  title: string;
  url: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsefulLinkCategoryItem {
  _id: string;
  title: string;
  links: UsefulLinkItem[];
  createdBy?: string;
  createdById?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface NewLinkFormRow {
  _id?: string;
  title: string;
  url: string;
}

export const UsefulLinks: React.FC = () => {
  const { user, token, addNotification } = useAuthStore();

  const roleLower = (user?.role || '').toLowerCase();
  const isAdmin = roleLower === 'admin';
  const isAdvocate = roleLower === 'advocate';

  // Core Data States
  const [categories, setCategories] = useState<UsefulLinkCategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Category Detail View (Displays associated links)
  const [selectedCategory, setSelectedCategory] = useState<UsefulLinkCategoryItem | null>(null);

  // Admin Add / Edit Category Modal States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryTitle, setCategoryFormTitle] = useState<string>('');
  const [categoryLinks, setCategoryFormLinks] = useState<NewLinkFormRow[]>([]);
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null);
  const [categorySubmitting, setCategorySubmitting] = useState<boolean>(false);

  // Admin Delete Category Confirmation Modal States
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<UsefulLinkCategoryItem | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState<boolean>(false);

  // Admin Add / Edit Individual Link Modal States (Inside category view)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [linkFormTitle, setLinkFormTitle] = useState<string>('');
  const [linkFormUrl, setLinkFormUrl] = useState<string>('');
  const [linkFormError, setLinkFormError] = useState<string | null>(null);
  const [linkSubmitting, setLinkSubmitting] = useState<boolean>(false);

  // Admin Delete Individual Link Confirmation Modal States
  const [deleteLinkTarget, setDeleteLinkTarget] = useState<UsefulLinkItem | null>(null);
  const [isDeletingLink, setIsDeletingLink] = useState<boolean>(false);

  // Fetch categories on mount or token change
  useEffect(() => {
    if (token) {
      fetchCategories();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCategories = async (preserveSelectedId?: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(getApiUrl('/api/useful-links'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const fetchedList: UsefulLinkCategoryItem[] = Array.isArray(data.categories) ? data.categories : [];
        setCategories(fetchedList);

        // Keep selected category synchronized if open
        const targetId = preserveSelectedId || selectedCategory?._id;
        if (targetId) {
          const updatedSelected = fetchedList.find(c => c._id === targetId) || null;
          setSelectedCategory(updatedSelected);
        }
      } else {
        if (res.status === 401) {
          setErrorMsg('Authentication required. Please sign in to access Useful Links.');
        } else if (res.status === 403) {
          setErrorMsg(data.message || 'Access Denied: Useful Links module is restricted exclusively to Administrators and Advocates.');
        } else {
          setErrorMsg(data.message || 'Failed to load Useful Links from server.');
        }
      }
    } catch (err: any) {
      console.error('Error fetching useful links categories:', err);
      setErrorMsg('Unable to connect to the legal database server. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  // URL Validation helper (frontend)
  const validateUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed.toLowerCase().startsWith('javascript:') || trimmed.toLowerCase().startsWith('data:')) {
      return false;
    }
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Filter categories by title
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(c => c.title.toLowerCase().includes(q));
  }, [categories, searchQuery]);

  // Total links count across all categories
  const totalLinksCount = useMemo(() => {
    return categories.reduce((sum, cat) => sum + (cat.links?.length || 0), 0);
  }, [categories]);

  // ------------------------------------------------------------------
  // ADMIN CATEGORY HANDLERS
  // ------------------------------------------------------------------
  const handleOpenAddCategoryModal = () => {
    setEditingCategoryId(null);
    setCategoryFormTitle('');
    setCategoryFormLinks([{ title: '', url: '' }]);
    setCategoryFormError(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (cat: UsefulLinkCategoryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCategoryId(cat._id);
    setCategoryFormTitle(cat.title);
    setCategoryFormLinks(
      cat.links && cat.links.length > 0
        ? cat.links.map(l => ({ _id: l._id, title: l.title, url: l.url }))
        : [{ title: '', url: '' }]
    );
    setCategoryFormError(null);
    setIsCategoryModalOpen(true);
  };

  const handleAddLinkRow = () => {
    setCategoryFormLinks(prev => [...prev, { title: '', url: '' }]);
  };

  const handleRemoveLinkRow = (index: number) => {
    setCategoryFormLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleLinkRowChange = (index: number, field: 'title' | 'url', val: string) => {
    setCategoryFormLinks(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (categorySubmitting) return;

    const trimmedTitle = categoryTitle.trim();
    if (!trimmedTitle) {
      setCategoryFormError('Category title is required and cannot be empty.');
      return;
    }

    // Validate link rows
    const validLinks: Array<{ _id?: string; title: string; url: string }> = [];
    for (let i = 0; i < categoryLinks.length; i++) {
      const row = categoryLinks[i];
      const rowTitle = row.title.trim();
      const rowUrl = row.url.trim();

      // Skip completely blank rows
      if (!rowTitle && !rowUrl) continue;

      if (!rowTitle) {
        setCategoryFormError(`Link #${i + 1} requires a display name or title.`);
        return;
      }

      if (!validateUrl(rowUrl)) {
        setCategoryFormError(`Link "${rowTitle}" has an invalid URL. Please enter a complete HTTP or HTTPS URL (e.g., https://example.com).`);
        return;
      }

      validLinks.push({
        _id: row._id,
        title: rowTitle,
        url: rowUrl
      });
    }

    setCategorySubmitting(true);
    setCategoryFormError(null);

    try {
      const endpoint = editingCategoryId
        ? `/api/useful-links/${editingCategoryId}`
        : '/api/useful-links';
      const method = editingCategoryId ? 'PUT' : 'POST';

      const res = await fetch(getApiUrl(endpoint), {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: trimmedTitle,
          links: validLinks
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsCategoryModalOpen(false);
        addNotification(
          'Success',
          editingCategoryId ? 'Category updated successfully.' : 'Useful Links category created successfully.',
          'success'
        );
        await fetchCategories(editingCategoryId || data.category?._id);
      } else {
        setCategoryFormError(data.message || 'Operation failed. Please review your entries.');
      }
    } catch (err: any) {
      console.error('Error submitting category:', err);
      setCategoryFormError('Network communication error. Please try again.');
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleOpenDeleteCategoryModal = (cat: UsefulLinkCategoryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteCategoryTarget(cat);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deleteCategoryTarget || isDeletingCategory) return;

    setIsDeletingCategory(true);
    try {
      const res = await fetch(getApiUrl(`/api/useful-links/${deleteCategoryTarget._id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        addNotification('Deleted', `Category "${deleteCategoryTarget.title}" and its links removed.`, 'info');
        if (selectedCategory?._id === deleteCategoryTarget._id) {
          setSelectedCategory(null);
        }
        setDeleteCategoryTarget(null);
        await fetchCategories();
      } else {
        addNotification('Error', data.message || 'Failed to delete category.', 'error');
      }
    } catch (err: any) {
      console.error('Error deleting category:', err);
      addNotification('Error', 'Network communication error during deletion.', 'error');
    } finally {
      setIsDeletingCategory(false);
    }
  };

  // ------------------------------------------------------------------
  // ADMIN INDIVIDUAL LINK HANDLERS (Inside category detail view)
  // ------------------------------------------------------------------
  const handleOpenAddLinkModal = () => {
    setEditingLinkId(null);
    setLinkFormTitle('');
    setLinkFormUrl('');
    setLinkFormError(null);
    setIsLinkModalOpen(true);
  };

  const handleOpenEditLinkModal = (link: UsefulLinkItem) => {
    setEditingLinkId(link._id);
    setLinkFormTitle(link.title);
    setLinkFormUrl(link.url);
    setLinkFormError(null);
    setIsLinkModalOpen(true);
  };

  const handleSubmitLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || linkSubmitting) return;

    const trimmedTitle = linkFormTitle.trim();
    const trimmedUrl = linkFormUrl.trim();

    if (!trimmedTitle) {
      setLinkFormError('Link title/display name is required.');
      return;
    }

    if (!validateUrl(trimmedUrl)) {
      setLinkFormError('Invalid website URL. Only valid HTTP or HTTPS URLs are accepted.');
      return;
    }

    setLinkSubmitting(true);
    setLinkFormError(null);

    try {
      const endpoint = editingLinkId
        ? `/api/useful-links/${selectedCategory._id}/links/${editingLinkId}`
        : `/api/useful-links/${selectedCategory._id}/links`;
      const method = editingLinkId ? 'PUT' : 'POST';

      const res = await fetch(getApiUrl(endpoint), {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: trimmedTitle,
          url: trimmedUrl
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsLinkModalOpen(false);
        addNotification(
          'Success',
          editingLinkId ? 'Link updated successfully.' : 'New useful link added.',
          'success'
        );
        await fetchCategories(selectedCategory._id);
      } else {
        setLinkFormError(data.message || 'Failed to save link.');
      }
    } catch (err: any) {
      console.error('Error saving link:', err);
      setLinkFormError('Network communication error. Please try again.');
    } finally {
      setLinkSubmitting(false);
    }
  };

  const handleOpenDeleteLinkModal = (link: UsefulLinkItem) => {
    setDeleteLinkTarget(link);
  };

  const handleConfirmDeleteLink = async () => {
    if (!selectedCategory || !deleteLinkTarget || isDeletingLink) return;

    setIsDeletingLink(true);
    try {
      const res = await fetch(getApiUrl(`/api/useful-links/${selectedCategory._id}/links/${deleteLinkTarget._id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        addNotification('Deleted', `Link "${deleteLinkTarget.title}" removed.`, 'info');
        setDeleteLinkTarget(null);
        await fetchCategories(selectedCategory._id);
      } else {
        addNotification('Error', data.message || 'Failed to delete link.', 'error');
      }
    } catch (err: any) {
      console.error('Error deleting link:', err);
      addNotification('Error', 'Network communication error during link deletion.', 'error');
    } finally {
      setIsDeletingLink(false);
    }
  };

  // ------------------------------------------------------------------
  // GUARD: Unauthorized direct render fallback
  // ------------------------------------------------------------------
  if (!isAdmin && !isAdvocate) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 bg-[#FFFDF8] dark:bg-[#171916]">
        <div className="max-w-md w-full bg-[#FFFFFF] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#30352F] p-8 rounded-2xl shadow-sm text-center">
          <ShieldAlert className="w-12 h-12 text-[#914F45] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#242522] dark:text-[#F4F0E7] mb-2">Access Denied</h2>
          <p className="text-sm text-[#625F58] dark:text-[#C5C0B6]">
            The Useful Links module is accessible strictly to verified Advocate and Administrator accounts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] dark:bg-[#171916] text-[#242522] dark:text-[#F4F0E7] pb-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* ========================================================= */}
        {/* VIEW 1: CATEGORY DETAIL VIEW (Associated Links)           */}
        {/* ========================================================= */}
        {selectedCategory ? (
          <div className="space-y-6 animate-fade-in">
            {/* Breadcrumb & Back Action */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedCategory(null)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#EFEAE0] dark:bg-[#242822] hover:bg-[#E5DFD3] dark:hover:bg-[#2F352C] text-[#183C32] dark:text-[#F4F0E7] border border-[#D8D1C5] dark:border-[#30352F] transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                Back to All Categories
              </button>

              <div className="text-xs text-[#625F58] dark:text-[#C5C0B6]">
                Viewing category: <span className="font-semibold text-[#183C32] dark:text-[#C7A45A]">{selectedCategory.title}</span>
              </div>
            </div>

            {/* Category Banner Card */}
            <div className="bg-[#FFFFFF] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#30352F] rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#183C32]/10 dark:bg-[#183C32]/30 text-[#183C32] dark:text-[#8FAF9C] border border-[#183C32]/20">
                      <Folder size={12} />
                      Category Details
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#A67C3B]/10 dark:bg-[#A67C3B]/25 text-[#A67C3B] dark:text-[#D8C49A] border border-[#A67C3B]/25">
                      {selectedCategory.links?.length || 0} Link{(selectedCategory.links?.length || 0) === 1 ? '' : 's'}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#242522] dark:text-[#F4F0E7] font-serif">
                    {selectedCategory.title}
                  </h1>
                  <p className="text-sm text-[#625F58] dark:text-[#C5C0B6]">
                    Browse and access verified legal portals, official registries, and related websites listed under this category.
                  </p>
                </div>

                {/* Admin Management Actions in Detail View */}
                {isAdmin && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={handleOpenAddLinkModal}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#183C32] hover:bg-[#122E26] text-[#FFFDF8] shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus size={15} />
                      Add Useful Link
                    </button>
                    <button
                      onClick={() => handleOpenEditCategoryModal(selectedCategory)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[#EFEAE0] dark:bg-[#242822] hover:bg-[#E5DFD3] dark:hover:bg-[#2F352C] text-[#242522] dark:text-[#F4F0E7] border border-[#D8D1C5] dark:border-[#30352F] transition-colors cursor-pointer"
                      title="Edit Category Title & Links"
                    >
                      <Edit3 size={14} />
                      Edit Category
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Associated Links List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base font-bold text-[#242522] dark:text-[#F4F0E7] flex items-center gap-2">
                  <BookmarkCheck size={16} className="text-[#A67C3B]" />
                  Associated Useful Links
                </h2>
                <span className="text-xs text-[#625F58] dark:text-[#C5C0B6]">
                  External links open securely in a new browser tab
                </span>
              </div>

              {(!selectedCategory.links || selectedCategory.links.length === 0) ? (
                <div className="bg-[#FFFFFF] dark:bg-[#1E211D] border border-dashed border-[#D8D1C5] dark:border-[#30352F] rounded-2xl p-10 text-center space-y-3">
                  <Globe className="w-10 h-10 text-[#A67C3B]/60 mx-auto" />
                  <h3 className="text-base font-bold text-[#242522] dark:text-[#F4F0E7]">
                    No links added under this category yet
                  </h3>
                  <p className="text-xs text-[#625F58] dark:text-[#C5C0B6] max-w-sm mx-auto">
                    {isAdmin
                      ? 'Click the button below to add your first useful website link to this category.'
                      : 'The administrator has not added any active links to this category yet.'}
                  </p>
                  {isAdmin && (
                    <button
                      onClick={handleOpenAddLinkModal}
                      className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#183C32] hover:bg-[#122E26] text-[#FFFDF8] shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                      Add First Link
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCategory.links.map((link) => (
                    <div
                      key={link._id}
                      className="bg-[#FFFFFF] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#30352F] rounded-xl p-5 shadow-xs hover:border-[#A67C3B]/50 transition-all duration-200 flex flex-col justify-between group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#183C32]/10 dark:bg-[#183C32]/25 text-[#183C32] dark:text-[#8FAF9C] flex items-center justify-center flex-shrink-0">
                              <Link2 size={16} />
                            </div>
                            <h3 className="font-bold text-sm text-[#242522] dark:text-[#F4F0E7] line-clamp-2">
                              {link.title}
                            </h3>
                          </div>

                          {/* Admin Controls for Individual Link */}
                          {isAdmin && (
                            <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 flex-shrink-0">
                              <button
                                onClick={() => handleOpenEditLinkModal(link)}
                                className="p-1 rounded-md text-[#625F58] hover:text-[#183C32] dark:text-[#C5C0B6] dark:hover:text-[#F4F0E7] hover:bg-[#EFEAE0] dark:hover:bg-[#242822] transition-colors cursor-pointer"
                                title="Edit Link"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => handleOpenDeleteLinkModal(link)}
                                className="p-1 rounded-md text-[#914F45] hover:text-[#B33927] hover:bg-[#FBEBE8] dark:hover:bg-[#38201D] transition-colors cursor-pointer"
                                title="Delete Link"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* URL Display */}
                        <div className="bg-[#FAF7F0] dark:bg-[#171916] px-3 py-1.5 rounded-lg border border-[#E8E2D5] dark:border-[#2C312A] overflow-hidden">
                          <p className="text-xs text-[#625F58] dark:text-[#A7A196] font-mono truncate" title={link.url}>
                            {link.url}
                          </p>
                        </div>
                      </div>

                      {/* Open Action */}
                      <div className="mt-4 pt-3 border-t border-[#EFEAE0] dark:border-[#2A2E28] flex items-center justify-between">
                        <span className="text-[11px] text-[#8C877D] dark:text-[#8D887E]">
                          Verified Resource
                        </span>

                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#183C32] hover:bg-[#122E26] text-[#FFFDF8] shadow-xs transition-colors cursor-pointer"
                        >
                          <span>Open Link</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* VIEW 2: MAIN CATEGORY LISTING (Displays Titles Only)      */
          /* ========================================================= */
          <div className="space-y-8 animate-fade-in">
            {/* Header Area */}
            <div className="bg-[#FFFFFF] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#30352F] rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#A67C3B]/10 dark:bg-[#A67C3B]/25 text-[#A67C3B] dark:text-[#D8C49A] border border-[#A67C3B]/25">
                      <BookmarkCheck size={12} />
                      Legal Directory
                    </span>
                    <span className="text-xs font-semibold text-[#625F58] dark:text-[#C5C0B6]">
                      {categories.length} Categor{categories.length === 1 ? 'y' : 'ies'} • {totalLinksCount} Links
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#242522] dark:text-[#F4F0E7] font-serif">
                    Useful Links
                  </h1>
                  <p className="text-sm text-[#625F58] dark:text-[#C5C0B6]">
                    Curated reference directory of legal portals, court registries, judicial databases, statutory libraries, and government gazettes.
                  </p>
                </div>

                {/* Admin "Add Category" Primary Action */}
                {isAdmin && (
                  <div className="flex-shrink-0">
                    <button
                      onClick={handleOpenAddCategoryModal}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#183C32] hover:bg-[#122E26] text-[#FFFDF8] shadow-sm transition-all duration-200 cursor-pointer"
                    >
                      <Plus size={16} />
                      Add Category
                    </button>
                  </div>
                )}
              </div>

              {/* Search Bar */}
              <div className="mt-6 pt-6 border-t border-[#EFEAE0] dark:border-[#2A2E28] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C877D] dark:text-[#8D887E]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search category titles..."
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#FAF7F0] dark:bg-[#171916] border border-[#D8D1C5] dark:border-[#30352F] text-[#242522] dark:text-[#F4F0E7] placeholder-[#8C877D] focus:outline-hidden focus:border-[#A67C3B] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C877D] hover:text-[#242522] dark:hover:text-[#F4F0E7]"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fetchCategories()}
                    className="p-2 rounded-lg bg-[#FAF7F0] dark:bg-[#171916] border border-[#D8D1C5] dark:border-[#30352F] text-[#625F58] hover:text-[#183C32] dark:text-[#C5C0B6] dark:hover:text-[#F4F0E7] transition-colors cursor-pointer"
                    title="Refresh categories"
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  </button>
                  <span className="text-xs text-[#8C877D] dark:text-[#8D887E]">
                    Showing {filteredCategories.length} of {categories.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-[#FBEBE8] dark:bg-[#38201D] border border-[#914F45]/30 text-[#914F45] dark:text-[#E5A8A0] text-xs flex items-center gap-3">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Loading Skeleton */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-36 rounded-2xl bg-[#EFEAE0]/60 dark:bg-[#20251F]/60 animate-pulse border border-[#D8D1C5]/50 dark:border-[#30352F]/50" />
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
              /* Empty State */
              <div className="bg-[#FFFFFF] dark:bg-[#1E211D] border border-dashed border-[#D8D1C5] dark:border-[#30352F] rounded-2xl p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#183C32]/10 dark:bg-[#183C32]/25 text-[#183C32] dark:text-[#8FAF9C] flex items-center justify-center mx-auto">
                  <Link2 size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#242522] dark:text-[#F4F0E7]">
                    {searchQuery ? 'No categories match your search' : 'No Useful Links Categories Added Yet'}
                  </h3>
                  <p className="text-xs text-[#625F58] dark:text-[#C5C0B6] max-w-md mx-auto">
                    {searchQuery
                      ? `Try clearing your search term "${searchQuery}" to view all categories.`
                      : isAdmin
                        ? 'Get started by creating your first category with its associated legal website links.'
                        : 'No useful link categories have been published by the administration yet. Please check back later.'}
                  </p>
                </div>
                {isAdmin && !searchQuery && (
                  <button
                    onClick={handleOpenAddCategoryModal}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#183C32] hover:bg-[#122E26] text-[#FFFDF8] shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    Add First Category
                  </button>
                )}
              </div>
            ) : (
              /* Category Titles Only Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCategories.map((category) => (
                  <div
                    key={category._id}
                    onClick={() => setSelectedCategory(category)}
                    className="group bg-[#FFFFFF] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#30352F] hover:border-[#A67C3B] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        {/* Emblem Icon */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#183C32]/10 to-[#A67C3B]/10 dark:from-[#183C32]/25 dark:to-[#A67C3B]/25 text-[#183C32] dark:text-[#D8C49A] border border-[#A67C3B]/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <Link2 size={18} />
                        </div>

                        {/* Admin Action Buttons */}
                        {isAdmin && (
                          <div
                            className="flex items-center gap-1 opacity-80 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) => handleOpenEditCategoryModal(category, e)}
                              className="p-1.5 rounded-lg text-[#625F58] hover:text-[#183C32] dark:text-[#C5C0B6] dark:hover:text-[#F4F0E7] hover:bg-[#EFEAE0] dark:hover:bg-[#242822] transition-colors cursor-pointer"
                              title="Edit Category & Links"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={(e) => handleOpenDeleteCategoryModal(category, e)}
                              className="p-1.5 rounded-lg text-[#914F45] hover:text-[#B33927] hover:bg-[#FBEBE8] dark:hover:bg-[#38201D] transition-colors cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Prominent Category Title (Display Title Only) */}
                      <div>
                        <h2 className="text-base font-bold text-[#242522] dark:text-[#F4F0E7] group-hover:text-[#183C32] dark:group-hover:text-[#D8C49A] transition-colors line-clamp-2">
                          {category.title}
                        </h2>
                      </div>
                    </div>

                    {/* Bottom Metadata & Click Action Indicator */}
                    <div className="mt-5 pt-3 border-t border-[#EFEAE0] dark:border-[#2A2E28] flex items-center justify-between">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#FAF7F0] dark:bg-[#171916] text-[#625F58] dark:text-[#C5C0B6] border border-[#E8E2D5] dark:border-[#2C312A]">
                        {category.links?.length || 0} Link{(category.links?.length || 0) === 1 ? '' : 's'}
                      </span>

                      <span className="text-xs font-bold text-[#183C32] dark:text-[#D8C49A] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        View Links →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 1: ADMIN ADD / EDIT CATEGORY (With Multiple Links)  */}
        {/* ========================================================= */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171916]/70 backdrop-blur-xs animate-fade-in">
            <div className="bg-[#FFFDF8] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#30352F] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-[#D8D1C5] dark:border-[#30352F] flex items-center justify-between bg-[#FFFFFF] dark:bg-[#1E211D]">
                <div>
                  <h3 className="text-lg font-bold text-[#242522] dark:text-[#F4F0E7]">
                    {editingCategoryId ? 'Edit Useful Links Category' : 'Add New Category'}
                  </h3>
                  <p className="text-xs text-[#625F58] dark:text-[#C5C0B6] mt-0.5">
                    Define the category title and associate its website links in a single submission.
                  </p>
                </div>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#625F58] dark:text-[#C5C0B6] hover:bg-[#EFEAE0] dark:hover:bg-[#242822] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleSubmitCategory} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {categoryFormError && (
                  <div className="p-3.5 rounded-xl bg-[#FBEBE8] dark:bg-[#38201D] border border-[#914F45]/30 text-[#914F45] dark:text-[#E5A8A0] text-xs flex items-center gap-2.5">
                    <AlertCircle size={15} className="flex-shrink-0" />
                    <span>{categoryFormError}</span>
                  </div>
                )}

                {/* Field A: Category Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#242522] dark:text-[#F4F0E7]">
                    Category Title <span className="text-[#914F45]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryTitle}
                    onChange={(e) => setCategoryFormTitle(e.target.value)}
                    placeholder="e.g. Legal Research Portals, Court Websites, Bare Acts & Judgments"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF7F0] dark:bg-[#171916] border border-[#D8D1C5] dark:border-[#30352F] text-[#242522] dark:text-[#F4F0E7] focus:outline-hidden focus:border-[#A67C3B]"
                  />
                  <p className="text-[11px] text-[#8C877D] dark:text-[#8D887E]">
                    The primary group name that identifies these related links on the main page.
                  </p>
                </div>

                {/* Field B: Useful Links Rows */}
                <div className="space-y-3 pt-2 border-t border-[#EFEAE0] dark:border-[#2A2E28]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#242522] dark:text-[#F4F0E7]">
                        Associated Useful Links
                      </h4>
                      <p className="text-[11px] text-[#8C877D] dark:text-[#8D887E]">
                        Add one or more destination links under this category.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddLinkRow}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#EFEAE0] dark:bg-[#242822] hover:bg-[#E5DFD3] dark:hover:bg-[#2F352C] text-[#183C32] dark:text-[#F4F0E7] border border-[#D8D1C5] dark:border-[#30352F] transition-colors cursor-pointer"
                    >
                      <Plus size={13} />
                      Add Another Link
                    </button>
                  </div>

                  <div className="space-y-3">
                    {categoryLinks.map((row, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#FAF7F0] dark:bg-[#171916] border border-[#E8E2D5] dark:border-[#2C312A] space-y-2.5 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#A67C3B] uppercase tracking-wider">
                            Link #{idx + 1}
                          </span>

                          {categoryLinks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLinkRow(idx)}
                              className="text-[11px] font-semibold text-[#914F45] hover:text-[#B33927] flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 size={12} />
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-medium text-[#625F58] dark:text-[#C5C0B6] mb-1">
                              Display Name / Website Name
                            </label>
                            <input
                              type="text"
                              value={row.title}
                              onChange={(e) => handleLinkRowChange(idx, 'title', e.target.value)}
                              placeholder="e.g. Legal Research Portal"
                              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#FFFDF8] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#30352F] text-[#242522] dark:text-[#F4F0E7] focus:outline-hidden focus:border-[#A67C3B]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-[#625F58] dark:text-[#C5C0B6] mb-1">
                              Website URL (HTTP / HTTPS)
                            </label>
                            <input
                              type="url"
                              value={row.url}
                              onChange={(e) => handleLinkRowChange(idx, 'url', e.target.value)}
                              placeholder="https://example.gov.in"
                              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#FFFDF8] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#30352F] text-[#242522] dark:text-[#F4F0E7] focus:outline-hidden focus:border-[#A67C3B]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="pt-4 border-t border-[#D8D1C5] dark:border-[#30352F] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    disabled={categorySubmitting}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#EFEAE0] dark:bg-[#242822] hover:bg-[#E5DFD3] dark:hover:bg-[#2F352C] text-[#242522] dark:text-[#F4F0E7] cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={categorySubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-[#183C32] hover:bg-[#122E26] text-[#FFFDF8] shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {categorySubmitting && <RefreshCw size={13} className="animate-spin" />}
                    <span>{editingCategoryId ? 'Save Changes' : 'Create Category'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 2: ADMIN DELETE CATEGORY CONFIRMATION               */}
        {/* ========================================================= */}
        {deleteCategoryTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171916]/70 backdrop-blur-xs animate-fade-in">
            <div className="bg-[#FFFDF8] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#30352F] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-[#914F45]">
                <div className="w-10 h-10 rounded-full bg-[#FBEBE8] dark:bg-[#38201D] flex items-center justify-center flex-shrink-0">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#242522] dark:text-[#F4F0E7]">
                    Delete Category?
                  </h3>
                  <p className="text-xs text-[#625F58] dark:text-[#C5C0B6]">
                    This action will permanently remove this record.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F0] dark:bg-[#171916] border border-[#E8E2D5] dark:border-[#2C312A] space-y-1">
                <p className="text-xs font-bold text-[#242522] dark:text-[#F4F0E7]">
                  Category: <span className="font-serif">{deleteCategoryTarget.title}</span>
                </p>
                <p className="text-[11px] text-[#914F45] dark:text-[#E5A8A0]">
                  Warning: All {deleteCategoryTarget.links?.length || 0} associated useful link(s) will also be deleted immediately.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteCategoryTarget(null)}
                  disabled={isDeletingCategory}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#EFEAE0] dark:bg-[#242822] hover:bg-[#E5DFD3] dark:hover:bg-[#2F352C] text-[#242522] dark:text-[#F4F0E7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteCategory}
                  disabled={isDeletingCategory}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-[#914F45] hover:bg-[#7D4239] text-[#FFFDF8] shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isDeletingCategory && <RefreshCw size={13} className="animate-spin" />}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 3: ADMIN ADD / EDIT INDIVIDUAL LINK                 */}
        {/* ========================================================= */}
        {isLinkModalOpen && selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171916]/70 backdrop-blur-xs animate-fade-in">
            <div className="bg-[#FFFDF8] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#30352F] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-[#D8D1C5] dark:border-[#30352F] flex items-center justify-between bg-[#FFFFFF] dark:bg-[#1E211D]">
                <div>
                  <h3 className="text-base font-bold text-[#242522] dark:text-[#F4F0E7]">
                    {editingLinkId ? 'Edit Useful Link' : 'Add Useful Link'}
                  </h3>
                  <p className="text-xs text-[#625F58] dark:text-[#C5C0B6]">
                    Under category: <span className="font-semibold text-[#183C32] dark:text-[#C7A45A]">{selectedCategory.title}</span>
                  </p>
                </div>
                <button
                  onClick={() => setIsLinkModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#625F58] dark:text-[#C5C0B6] hover:bg-[#EFEAE0] dark:hover:bg-[#242822] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitLink} className="p-5 sm:p-6 space-y-4">
                {linkFormError && (
                  <div className="p-3 rounded-xl bg-[#FBEBE8] dark:bg-[#38201D] border border-[#914F45]/30 text-[#914F45] dark:text-[#E5A8A0] text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    <span>{linkFormError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#242522] dark:text-[#F4F0E7]">
                    Link Display Name <span className="text-[#914F45]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={linkFormTitle}
                    onChange={(e) => setLinkFormTitle(e.target.value)}
                    placeholder="e.g. Supreme Court of India Portal"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FAF7F0] dark:bg-[#171916] border border-[#D8D1C5] dark:border-[#30352F] text-[#242522] dark:text-[#F4F0E7] focus:outline-hidden focus:border-[#A67C3B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#242522] dark:text-[#F4F0E7]">
                    Website URL (HTTP / HTTPS) <span className="text-[#914F45]">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={linkFormUrl}
                    onChange={(e) => setLinkFormUrl(e.target.value)}
                    placeholder="https://main.sci.gov.in"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FAF7F0] dark:bg-[#171916] border border-[#D8D1C5] dark:border-[#30352F] text-[#242522] dark:text-[#F4F0E7] focus:outline-hidden focus:border-[#A67C3B]"
                  />
                  <p className="text-[11px] text-[#8C877D] dark:text-[#8D887E]">
                    Must be a valid HTTP or HTTPS destination. Unsafe protocols are rejected.
                  </p>
                </div>

                <div className="pt-3 border-t border-[#D8D1C5] dark:border-[#30352F] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsLinkModalOpen(false)}
                    disabled={linkSubmitting}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#EFEAE0] dark:bg-[#242822] hover:bg-[#E5DFD3] dark:hover:bg-[#2F352C] text-[#242522] dark:text-[#F4F0E7] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={linkSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-[#183C32] hover:bg-[#122E26] text-[#FFFDF8] shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {linkSubmitting && <RefreshCw size={13} className="animate-spin" />}
                    <span>{editingLinkId ? 'Save Link' : 'Add Link'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 4: ADMIN DELETE INDIVIDUAL LINK CONFIRMATION        */}
        {/* ========================================================= */}
        {deleteLinkTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171916]/70 backdrop-blur-xs animate-fade-in">
            <div className="bg-[#FFFDF8] dark:bg-[#1E211D] border border-[#D8D1C5] dark:border-[#30352F] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-[#914F45]">
                <div className="w-10 h-10 rounded-full bg-[#FBEBE8] dark:bg-[#38201D] flex items-center justify-center flex-shrink-0">
                  <Trash2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#242522] dark:text-[#F4F0E7]">
                    Delete Link?
                  </h3>
                  <p className="text-xs text-[#625F58] dark:text-[#C5C0B6]">
                    Remove this individual link from the category.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F0] dark:bg-[#171916] border border-[#E8E2D5] dark:border-[#2C312A] space-y-1">
                <p className="text-xs font-bold text-[#242522] dark:text-[#F4F0E7]">
                  {deleteLinkTarget.title}
                </p>
                <p className="text-[11px] font-mono text-[#625F58] dark:text-[#A7A196] truncate">
                  {deleteLinkTarget.url}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteLinkTarget(null)}
                  disabled={isDeletingLink}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#EFEAE0] dark:bg-[#242822] hover:bg-[#E5DFD3] dark:hover:bg-[#2F352C] text-[#242522] dark:text-[#F4F0E7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteLink}
                  disabled={isDeletingLink}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-[#914F45] hover:bg-[#7D4239] text-[#FFFDF8] shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isDeletingLink && <RefreshCw size={13} className="animate-spin" />}
                  <span>Delete Link</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UsefulLinks;
