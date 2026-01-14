
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coffee,
  Palette,
  Calendar,
  Users,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  LayoutDashboard,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Settings,
  HelpCircle,
  MessageSquare,
  X,
  ChevronDown,
  Layers,
  TrendingUp,
  Menu,
} from 'lucide-react';
import SalesInsights from './SalesInsights';
import {
  useDataContext,
  CoffeeAdminItem,
  ArtAdminItem,
  WorkshopAdminItem,
  Order,
  Category,
  SubCategory,
  Tag,
} from '../DataContext';
import CategoryManager from './CategoryManager';
import { API_BASE_URL } from '../config';


interface AdminDashboardProps {
  onBack: () => void;
  onLogout: () => void;
}

interface FranchiseEnquiry {
  id: string;
  full_name: string;
  contact_number: string;
  email: string;
  enquiry: string;
  created_at: string;
  read: boolean;
  status?: string; // New, Contacted, In Progress, Converted, Closed
}

interface FranchiseFaqItem {
  id: number; // DB uses int
  question: string;
  answer: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'coffee' | 'orders' | 'art' | 'workshops' | 'manage_categories' | 'franchise_enquiries' | 'franchise_faqs' | 'franchise_settings' | 'sales_trends'>('overview');
  const [isFranchiseOpen, setIsFranchiseOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'coffee' as const, label: 'Menu', icon: Coffee },
    { id: 'orders' as const, label: 'Orders', icon: ClipboardList },
    { id: 'art' as const, label: 'Art Gallery', icon: Palette },
    { id: 'workshops' as const, label: 'Workshops', icon: Calendar },
    { id: 'manage_categories' as const, label: 'Manage Categories', icon: Layers },
    { id: 'franchise_enquiries' as const, label: 'Franchise Enquiries', icon: MessageSquare },
    { id: 'franchise_faqs' as const, label: 'Franchise FAQs', icon: HelpCircle },
    { id: 'franchise_settings' as const, label: 'Franchise Settings', icon: Settings },
  ];

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });
  const toastTimeoutRef = useRef<number | null>(null);

  const {
    artItems,
    workshops,
    toggleArtStatus,
    updateArtItem,
    deleteArtItem: apiDeleteArtItem,
    addWorkshop,
    addArtItem,
    orders,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
  } = useDataContext();

  // Create a ref or effect to make updateArtItem available to saveArtItem if scoping is an issue, 
  // but since saveArtItem is inside the component, it can just access it. 
  // I tried to use window hack above, let me correct that logic now that I am adding it here.
  // I will rewrite saveArtItem correctly in a separate chunk or just rely on the variable being there.

  // FIXING saveArtItem reference:
  // Since I can't easily edit two disparate blocks and reference a variable I just added, 
  // I will rely on the fact that `saveArtItem` defined later will see `updateArtItem`.
  // Wait, I defined `saveArtItem` in the PREVIOUS chunk. 
  // Code execution is sequential. Replace chunks apply to the file. 
  // So if I add `updateArtItem` here, the valid code in the previous chunk (which I should fix) will work.

  // Actually, I should just fix `saveArtItem` in the previous chunk to use `updateArtItem` properly.
  // But since I submitted that chunk with a comment about window hack, I should fix it.
  // Let's just create a safe wrapper here or assume I'll fix the implementation.
  // I will re-implement `saveArtItem` properly in this same `multi_replace` if possible? 
  // No, `multi_replace` takes a list. I can provide multiple chunks.

  // Let's just add `updateArtItem` here. I will re-submit the `saveArtItem` chunk to be correct.


  // Dynamically derive available categories from current menu items (for legacy display)
  // After migration, category is renamed to category_legacy
  const categoryOptions = useMemo(
    () => Array.from(new Set(menuItems.map(item => item.category || item.category_name || ''))).filter(Boolean).sort(),
    [menuItems]
  );


  // Dummy initial data – structured for easy API replacement later
  // Removed hardcoded coffeeItems - using useDataContext() instead


  // artItems and workshops now come from DataContext (see useDataContext above)

  // Removed hardcoded enquiries
  const [enquiries, setEnquiries] = useState<FranchiseEnquiry[]>([]);
  const [franchiseFaqs, setFranchiseFaqs] = useState<FranchiseFaqItem[]>([]);
  const [franchiseContact, setFranchiseContact] = useState<string>('');
  const [selectedEnquiry, setSelectedEnquiry] = useState<FranchiseEnquiry | null>(null);

  const refreshEnquiries = () => {
    fetch(`${API_BASE_URL}/api/franchise/enquiries`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEnquiries(data);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    // Fetch Enquiries
    refreshEnquiries();

    // Fetch FAQs
    fetch(`${API_BASE_URL}/api/franchise/faq`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFranchiseFaqs(data);
      })
      .catch(err => console.error(err));

    // Fetch Settings
    fetch(`${API_BASE_URL}/api/franchise/settings`)
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          if (err.error?.includes('relation')) showToast('Franchise tables missing', 'error');
          return; // Stop if error
        }
        return res.json();
      })
      .then(data => {
        if (data && data.contact_number) setFranchiseContact(data.contact_number);
      })
      .catch(err => console.error(err));
  }, []);

  const saveFranchiseContact = async (number: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/franchise/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_number: number })
      });
      if (res.ok) {
        setFranchiseContact(number);
        showToast('Contact number updated', 'success');
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData.error?.includes('relation') || errData.error?.includes('franchise_')) {
          showToast('Database tables missing. Run migration.', 'error');
        } else {
          showToast('Failed to update contact', 'error');
        }
      }
    } catch (e) {
      showToast('Error updating contact', 'error');
    }
  };

  const addFaq = async (question: string, answer: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/franchise/faq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer })
      });
      if (res.ok) {
        const newFaq = await res.json();
        if (newFaq && newFaq.id) {
          setFranchiseFaqs(prev => [...prev, newFaq]);
          showToast('FAQ added', 'success');
        } else {
          // Fallback refresh
          const items = await (await fetch(`${API_BASE_URL}/api/franchise/faq`)).json();
          setFranchiseFaqs(items);
          showToast('FAQ added', 'success');
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData.error?.includes('relation') || errData.error?.includes('franchise_')) {
          showToast('Database tables missing. Run migration.', 'error');
        } else {
          showToast('Failed to add FAQ', 'error');
        }
      }
    } catch (e) {
      showToast('Error adding FAQ', 'error');
    }
  };

  const deleteFaq = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/franchise/faq/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFranchiseFaqs(prev => prev.filter(f => f.id !== id));
        showToast('FAQ deleted', 'success');
      } else {
        showToast('Failed to delete FAQ', 'error');
      }
    } catch (e) {
      showToast('Error deleting FAQ', 'error');
    }
  };


  // Modal state for Coffee items
  const [coffeeModalOpen, setCoffeeModalOpen] = useState(false);
  const [editingCoffee, setEditingCoffee] = useState<CoffeeAdminItem | null>(null);
  const [coffeeDraft, setCoffeeDraft] = useState<Partial<CoffeeAdminItem>>({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [itemKind, setItemKind] = useState<'beverage' | 'food'>('beverage');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CoffeeAdminItem | ArtAdminItem | null>(null);

  // Modal state for Art items
  const [artModalOpen, setArtModalOpen] = useState(false);
  const [editingArt, setEditingArt] = useState<ArtAdminItem | null>(null);
  const [artDraft, setArtDraft] = useState<Partial<ArtAdminItem>>({});

  // Dynamic Categories, Sub-Categories, and Tags state
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [newSubCategoryName, setNewSubCategoryName] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // Fetch categories and tags on mount
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/categories`).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE_URL}/api/tags`).then(r => r.ok ? r.json() : [])
    ])
      .then(([cats, tags]) => {
        setCategories(cats || []);
        setAllTags(tags || []);
      })
      .catch(err => console.error('Error fetching categories/tags:', err));
  }, []);

  // Fetch sub-categories when category changes
  const fetchSubCategories = async (categoryId: string) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/sub-categories?category_id=${categoryId}`);
      if (res.ok) {
        const data = await res.json();
        setSubCategories(data || []);
      }
    } catch (err) {
      console.error('Error fetching sub-categories:', err);
    }
  };

  const openArtModalForNew = () => {
    setEditingArt(null);
    setArtDraft({
      title: '',
      artist: '',
      price: 0,
      status: 'Available',
      image: '/media/pic1.jpeg',
      stock: 1,
    });
    setArtModalOpen(true);
  };

  const openArtModalForEdit = (item: ArtAdminItem) => {
    setEditingArt(item);
    setArtDraft(item);
    setArtModalOpen(true);
  };

  const closeArtModal = () => {
    setArtModalOpen(false);
  };

  const handleArtDraftChange = (field: keyof ArtAdminItem, value: any) => {
    setArtDraft(prev => ({ ...prev, [field]: value }));
  };

  /* New helper for file upload */
  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return data.url;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const saveArtItem = async () => {
    console.log("saveArtItem called", artDraft);
    if (!artDraft.title || artDraft.price == null) {
      console.log("Validation failed", { title: artDraft.title, price: artDraft.price });
      showToast('Please fill in required fields', 'error');
      return;
    }

    let imageToUse = artDraft.image || '/media/pic1.jpeg';

    if (selectedFile) {
      const uploadedUrl = await uploadImage(selectedFile);
      if (uploadedUrl) imageToUse = uploadedUrl;
    }

    // Auto-status based on stock
    const stockVal = Number(artDraft.stock || 0);
    const statusVal = stockVal > 0 ? 'Available' : 'Sold';

    try {
      if (editingArt) {
        // For updates, we pass everything that changed
        const updates: any = {
          title: artDraft.title,
          price: Number(artDraft.price),
          image: imageToUse,
          stock: stockVal,
          status: statusVal
        };
        await updateArtItem(editingArt.id, updates);
        showToast('Art item updated successfully', 'success');
      } else {
        const newArt: ArtAdminItem = {
          id: `a${Date.now()}`,
          title: artDraft.title,
          artist: '', // Artist removed from UI, defaulting to empty
          price: Number(artDraft.price),
          status: statusVal,
          image: imageToUse,
          stock: stockVal,
        };
        await addArtItem(newArt);
        showToast('Art item added successfully', 'success');
      }
      setArtModalOpen(false);
      setSelectedFile(null); // Reset file
    } catch (e) {
      showToast('Action failed', 'error');
    }
  };



  // Re-purposing the delete modal confirm button... 
  // It currently calls `confirmDeleteCoffeeItem`. I should make it generic or have a switch.
  // Let's rename the existing confirm function to `confirmDelete` and handle both via a 'deleteType' state.


  const openCoffeeModalForNew = () => {
    setEditingCoffee(null);
    setNewCategoryName('');
    setNewSubCategoryName('');
    setSelectedTags([]);
    setTagSearchQuery('');
    setSubCategories([]);
    setItemKind('beverage');
    setCoffeeDraft({
      name: '',
      description: '',
      category_id: categories[0]?.id || null,
      sub_category_id: null,
      price: 0,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      caffeine_mg: null,
      calories: null,
      shareable: 0,
      intensity_level: null,
    });
    // Fetch sub-categories for first category
    if (categories[0]?.id) {
      fetchSubCategories(categories[0].id);
    }
    setCoffeeModalOpen(true);
  };

  const openCoffeeModalForEdit = async (item: CoffeeAdminItem) => {
    setEditingCoffee(item);
    setNewCategoryName('');
    setNewSubCategoryName('');
    setTagSearchQuery('');

    // Determine if food based on category name
    const categoryName = item.category_name || item.category || '';
    const isFoodCategory = (categoryName ?? '').trim().toUpperCase().includes('FOOD');
    setItemKind(isFoodCategory ? 'food' : 'beverage');
    setCoffeeDraft(item);

    // Load sub-categories for this item's category
    if (item.category_id) {
      fetchSubCategories(item.category_id);
    } else {
      setSubCategories([]);
    }

    // Load tags for this item
    try {
      const res = await fetch(`${API_BASE_URL}/api/menu/${item.id}/tags`);
      if (res.ok) {
        const tags = await res.json();
        setSelectedTags(tags || []);
      } else {
        setSelectedTags([]);
      }
    } catch (err) {
      console.error('Error fetching item tags:', err);
      setSelectedTags([]);
    }

    setCoffeeModalOpen(true);
  };

  const closeCoffeeModal = () => {
    setCoffeeModalOpen(false);
    setSelectedTags([]);
    setTagSearchQuery('');
    setShowTagDropdown(false);
  };

  const handleCoffeeDraftChange = (field: keyof CoffeeAdminItem, value: any) => {
    setCoffeeDraft(prev => ({ ...prev, [field]: value }));

    // If category changes, update sub-categories logic
    if (field === 'category_id') {
      // Always reset sub-category selection when category changes
      setCoffeeDraft(prev => ({ ...prev, sub_category_id: null }));

      if (value && value !== '__NEW__') {
        fetchSubCategories(value);
      } else {
        // If "New" or empty, clear sub-categories options
        setSubCategories([]);
      }
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const saveCoffeeItem = async () => {
    if (!coffeeDraft.name || coffeeDraft.price == null) return;

    const draftName = (coffeeDraft.name ?? '').trim();
    if (!draftName) return;

    let categoryId = coffeeDraft.category_id;
    let subCategoryId = coffeeDraft.sub_category_id;

    // Handle creating new category
    if (coffeeDraft.category_id === '__NEW__') {
      const trimmedNewCategory = (newCategoryName ?? '').trim();
      if (!trimmedNewCategory) {
        showToast('Please enter a name for the new category', 'error');
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: trimmedNewCategory })
        });
        if (res.ok || res.status === 201) {
          const newCat = await res.json();
          categoryId = newCat.id;
          setCategories(prev => [...prev, newCat]);
          showToast(`Category "${newCat.name}" created`, 'success');
        } else {
          showToast('Failed to create category', 'error');
          return;
        }
      } catch (err) {
        showToast('Error creating category', 'error');
        return;
      }
    }

    // Handle creating new sub-category
    if (coffeeDraft.sub_category_id === '__NEW__') {
      const trimmedNewSubCategory = (newSubCategoryName ?? '').trim();
      if (!trimmedNewSubCategory) {
        showToast('Please enter a name for the new sub-category', 'error');
        return;
      }
      // Ensure we have a valid category ID (not __NEW__)
      if (!categoryId || categoryId === '__NEW__') {
        showToast('Invalid category for sub-category', 'error');
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/sub-categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category_id: categoryId, name: trimmedNewSubCategory })
        });
        if (res.ok || res.status === 201) {
          const newSubCat = await res.json();
          subCategoryId = newSubCat.id;
          setSubCategories(prev => [...prev, newSubCat]);
          showToast(`Sub-category "${newSubCat.name}" created`, 'success');
        } else {
          showToast('Failed to create sub-category', 'error');
          return;
        }
      } catch (err) {
        showToast('Error creating sub-category', 'error');
        return;
      }
    }

    console.log("Saving menu item", { coffeeDraft, categoryId, subCategoryId, selectedTags });

    const itemData: any = {
      name: draftName,
      category_id: categoryId,
      sub_category_id: subCategoryId || null,
      price: Number(coffeeDraft.price),
      caffeine: coffeeDraft.caffeine || 'High',
      caffeine_mg: itemKind === 'beverage' ? (coffeeDraft.caffeine_mg ?? null) : null,
      calories: itemKind === 'food' ? (coffeeDraft.calories ?? null) : null,
      shareable: itemKind === 'food' ? (coffeeDraft.shareable ? 1 : 0) : null,
      intensity_level: coffeeDraft.intensity_level ?? null,
      image: coffeeDraft.image || '/media/pic1.jpeg',
      description: coffeeDraft.description || '',
      tag_ids: selectedTags.map(t => t.id),
    };

    try {
      if (editingCoffee) {
        await updateMenuItem(editingCoffee.id, itemData);
        showToast('Item updated successfully', 'success');
      } else {
        const newId = `c${Date.now()}`;
        await addMenuItem({ id: newId, ...itemData });
        showToast('Item added successfully', 'success');
      }

      // Close modal and reset state
      setCoffeeModalOpen(false);
      setSelectedTags([]);
      // No reload needed as DataContext updates the list automatically
    } catch (err: any) {
      console.error('Error saving item:', err);
      showToast(err.message || 'Failed to save item', 'error');
    }
  };

  const deleteCoffeeItem = (id: string) => {
    const item = menuItems.find(m => m.id === id) || null;
    setItemToDelete(item || null);
    setDeleteModalOpen(true);
  };

  const cancelDeleteCoffeeItem = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  /* Unified Delete Logic */
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    if ('category' in itemToDelete) {
      // It's a CoffeeAdminItem (Menu Item)
      deleteMenuItem(itemToDelete.id);
      showToast(`Menu item "${itemToDelete.name}" deleted`, 'success');
    } else {
      // It's an ArtAdminItem
      await apiDeleteArtItem(itemToDelete.id);
      showToast(`Artwork "${itemToDelete.title}" deleted`, 'success');
    }
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const deleteArtItem = (id: string) => {
    const item = artItems.find(a => a.id === id);
    if (!item) return;
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  // toggleArtStatus and addWorkshop are provided by DataContext
  const createWorkshop = () => {
    const newItem: WorkshopAdminItem = {
      id: `w${Date.now()}`,
      title: 'New Workshop',
      datetime: 'TBD',
      seats: 12,
      booked: 0,
      price: 0,
    };
    addWorkshop(newItem);
  };

  const markEnquiryRead = (id: string) => {
    setEnquiries(prev => prev.map(e => (e.id === id ? { ...e, read: true } : e)));
  };

  const deleteEnquiry = (id: string) => {
    setEnquiries(prev => prev.filter(e => e.id !== id));
  };

  const activeTabLabel = useMemo(() => {
    const allItems = [
      ...tabs,
      { id: 'franchise_enquiries', label: 'Franchise Enquiries' },
      { id: 'franchise_faqs', label: 'Franchise FAQs' },
      { id: 'franchise_settings', label: 'Franchise Settings' },
      { id: 'sales_trends', label: 'Sales Trends' }
    ];
    return allItems.find(t => t.id === activeTab)?.label || 'Dashboard';
  }, [activeTab]);

  // Classification helpers for beverages vs food based on category naming
  const foodItems = menuItems.filter(item => (item.category ?? '').trim().toUpperCase().includes('FOOD'));
  const beverageItems = menuItems.filter(item => !(item.category ?? '').trim().toUpperCase().includes('FOOD'));
  const beverageCount = beverageItems.length;
  const foodCount = foodItems.length;
  const enquiryCount = enquiries.length;

  return (
    <div className="flex h-screen bg-[#F9F8F4] pt-0 md:pt-10 text-[#0a0a0a] relative overflow-hidden">
      {/* Mobile Hamburger Button - Only show when menu is closed */}
      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white/90 border border-black/10 rounded-lg shadow-sm hover:bg-white transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-[#0a0a0a]" />
        </button>
      )}

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-40 bg-black/60"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop visible, Mobile as drawer */}
      <motion.aside
        initial={false}
        animate={{ x: isMobileMenuOpen ? 0 : '-100%' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed md:relative w-64 h-full border-r border-black/5 px-6 pt-2 md:pt-10 pb-4 md:pb-6 flex flex-col bg-white z-40 md:z-auto md:translate-x-0 md:!translate-x-0 top-0 overflow-y-auto"
      >
        <div className="mb-4 md:mb-6 text-[#0a0a0a] mt-12 md:mt-0">
          <p className="text-2xl md:text-3xl font-serif font-bold text-black">Admin Panel</p>
        </div>

        <nav className="flex-1 space-y-1 text-sm font-sans uppercase tracking-[0.18em]">
          {/* Top Level Items */}
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'coffee', label: 'Menu', icon: Coffee },
            { id: 'orders', label: 'Orders', icon: ClipboardList },
            { id: 'art', label: 'Art Gallery', icon: Palette },
            { id: 'workshops', label: 'Workshops', icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-left transition-all border-l-2 ${activeTab === tab.id
                ? 'border-black font-semibold text-[#0a0a0a]'
                : 'border-transparent text-zinc-500 hover:text-[#0a0a0a] hover:border-black/10'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}

          {/* Insights Section */}
          <div className="pt-2">
            <button
              onClick={() => setIsInsightsOpen(!isInsightsOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 text-left transition-all border-l-2 ${['sales_trends'].includes(activeTab)
                ? 'border-black text-[#0a0a0a]'
                : 'border-transparent text-zinc-500 hover:text-[#0a0a0a] hover:border-black/10'
                }`}
            >
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-4 h-4" />
                <span>Insights</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${isInsightsOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence>
              {isInsightsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setActiveTab('sales_trends');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 pl-10 text-left transition-all ${activeTab === 'sales_trends'
                      ? 'text-[#0a0a0a] font-semibold'
                      : 'text-zinc-500 hover:text-[#0a0a0a]'
                      }`}
                  >
                    <span className="text-[10px] tracking-[0.25em]">Sales Trends</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Franchise Section */}
          <div className="pt-2">
            <button
              onClick={() => setIsFranchiseOpen(!isFranchiseOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 text-left transition-all border-l-2 ${['franchise_enquiries', 'franchise_faqs', 'franchise_settings'].includes(activeTab)
                ? 'border-black text-[#0a0a0a]'
                : 'border-transparent text-zinc-500 hover:text-[#0a0a0a] hover:border-black/10'
                }`}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4" />
                <span>Franchise</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${isFranchiseOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {isFranchiseOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {[
                    { id: 'franchise_enquiries', label: 'Enquiries', icon: MessageSquare },
                    { id: 'franchise_faqs', label: 'FAQs', icon: HelpCircle },
                    { id: 'franchise_settings', label: 'Settings', icon: Settings },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveTab(sub.id as any);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 pl-10 text-left transition-all ${activeTab === sub.id
                        ? 'text-[#0a0a0a] font-semibold'
                        : 'text-zinc-500 hover:text-[#0a0a0a]'
                        }`}
                    >
                      <sub.icon className="w-3 h-3" />
                      <span className="text-[10px] tracking-[0.25em]">{sub.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 hover:bg-black/5 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-[#0a0a0a]" />
        </button>

        {/* Rabuste logo near bottom, above Exit button */}
        <div className="mt-auto mb-4 md:mb-12 px-3 flex items-center justify-center">
          <img
            src="/media/logo.png"
            alt="Rabuste Coffee Logo"
            className="h-16 md:h-24 w-auto object-contain mx-auto brightness-0"
          />
        </div>

        <button
          onClick={() => {
            setIsMobileMenuOpen(false);
            onLogout();
            onBack();
          }}
          className="flex items-center space-x-2 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500 hover:text-red-500 transition-all mb-4 md:mb-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Dashboard</span>
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 w-full md:w-auto scroll-smooth">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-center md:justify-between mb-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-serif italic tracking-tight mb-3">
              {activeTabLabel}
            </h1>
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-zinc-500 font-sans">
              Rabuste Coffee — Internal Console
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            {activeTab === 'coffee' && (
              <button
                onClick={openCoffeeModalForNew}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#0a0a0a] text-[#F9F8F4] text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-black transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Item</span>
              </button>
            )}

            {activeTab === 'art' && (
              <button
                onClick={openArtModalForNew}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#0a0a0a] text-[#F9F8F4] text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-black transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Art</span>
              </button>
            )}

            {activeTab === 'workshops' && (
              <button
                onClick={createWorkshop}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#0a0a0a] text-[#F9F8F4] text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-black transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Workshop</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <OverviewCard label="Beverages" value={beverageCount} />
            <OverviewCard label="Food" value={foodCount} />
            <OverviewCard label="Artworks" value={artItems.length} />
            <OverviewCard label="Workshops" value={workshops.length} />
            <OverviewCard label="Franchise Leads" value={enquiryCount} />
          </div>
        )}

        {activeTab === 'sales_trends' && <SalesInsights />}

        {activeTab === 'coffee' && (
          <CoffeeTable
            items={menuItems}
            onEdit={openCoffeeModalForEdit}
            onDelete={deleteCoffeeItem}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTable items={orders} />
        )}

        {activeTab === 'art' && (
          <ArtTable items={artItems} onToggleStatus={toggleArtStatus} onEdit={openArtModalForEdit} onDelete={deleteArtItem} />
        )}

        {activeTab === 'workshops' && <WorkshopTable items={workshops} />}

        {activeTab === 'manage_categories' && (
          <div className="max-w-3xl">
            <div className="mb-6">
              <h2 className="text-2xl font-serif italic text-black">Manage Categories</h2>
              <p className="text-[13px] text-zinc-500 mt-1">Create, rename, and delete categories and sub-categories</p>
            </div>
            <CategoryManager
              selectedCategoryId={selectedCategoryId}
              onCategorySelect={setSelectedCategoryId}
            />
          </div>
        )}

        {activeTab === 'franchise_enquiries' && (
          <FranchiseTable
            items={enquiries}
            onMarkRead={markEnquiryRead}
            onDelete={deleteEnquiry}
            onView={(item) => setSelectedEnquiry(item)}
          />
        )}

        {/* Enquiry Modal */}
        {selectedEnquiry && (
          <EnquiryDetailModal
            enquiry={selectedEnquiry}
            onClose={() => setSelectedEnquiry(null)}
            onUpdateStatus={async (id, status) => {
              try {
                const res = await fetch(`${API_BASE_URL}/api/franchise/enquiries/${id}/status`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status })
                });
                if (res.ok) {
                  showToast('Status updated', 'success');
                  setSelectedEnquiry(null);
                  refreshEnquiries(); // Refresh list
                } else {
                  showToast('Failed to update status', 'error');
                }
              } catch (e) {
                showToast('Error updating status', 'error');
              }
            }}
          />
        )}

        {activeTab === 'franchise_faqs' && (
          <FranchiseFaqManager
            items={franchiseFaqs}
            onAdd={addFaq}
            onDelete={deleteFaq}
          />
        )}

        {activeTab === 'franchise_settings' && (
          <FranchiseSettingsManager
            contactNumber={franchiseContact}
            onSave={saveFranchiseContact}
          />
        )}
      </main>

      {/* Coffee modal - Notion/Linear styled */}
      {coffeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-[600px] bg-white rounded-[20px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-[#EBEBEB] flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-[#111]">{editingCoffee ? 'Edit Item' : 'Add New Item'}</h2>
              <button
                onClick={closeCoffeeModal}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F5F5F5] transition-colors"
              >
                <X className="w-4 h-4 text-[#999]" />
              </button>
            </div>


            {/* Form Content - 32px padding */}
            <div className="p-8 space-y-4 overflow-y-auto flex-1">
              {/* Item Type - Segmented Control */}
              <div>
                <label className="block text-[12px] font-semibold text-[#333] uppercase tracking-[0.05em] mb-3">Item Type</label>
                <div className="flex p-1 bg-[#F5F5F5] rounded-[12px]">
                  <button
                    type="button"
                    onClick={() => setItemKind('beverage')}
                    className={`flex-1 h-[40px] text-[14px] font-medium rounded-[10px] transition-all ${itemKind === 'beverage'
                      ? 'bg-white text-[#111] shadow-sm'
                      : 'text-[#666] hover:text-[#333]'
                      }`}
                  >
                    Beverage
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemKind('food')}
                    className={`flex-1 h-[40px] text-[14px] font-medium rounded-[10px] transition-all ${itemKind === 'food'
                      ? 'bg-white text-[#111] shadow-sm'
                      : 'text-[#666] hover:text-[#333]'
                      }`}
                  >
                    Food
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#F0F0F0]" />

              {/* Name */}
              <div>
                <label className="block text-[12px] font-semibold text-[#333] uppercase tracking-[0.05em] mb-2">Name</label>
                <input
                  type="text"
                  value={coffeeDraft.name || ''}
                  onChange={e => handleCoffeeDraftChange('name', e.target.value)}
                  placeholder="e.g. Robusta Espresso"
                  className="w-full h-[46px] px-4 text-[14px] text-[#111] placeholder-[#AAA] border border-[#DDD] rounded-[12px] outline-none focus:border-[#111] transition-colors"
                />
              </div>

              {/* 2-Column Grid: Price & Caffeine/Calories */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[#333] uppercase tracking-[0.05em] mb-2">Price (₹)</label>
                  <input
                    type="number"
                    value={coffeeDraft.price ?? ''}
                    onChange={e => handleCoffeeDraftChange('price', Number(e.target.value))}
                    placeholder="0"
                    className="w-full h-[46px] px-4 text-[14px] text-[#111] placeholder-[#AAA] border border-[#DDD] rounded-[12px] outline-none focus:border-[#111] transition-colors"
                  />
                </div>

                {itemKind === 'beverage' ? (
                  <div>
                    <label className="block text-[12px] font-semibold text-[#333] uppercase tracking-[0.05em] mb-2">Caffeine (mg)</label>
                    <input
                      type="number"
                      value={coffeeDraft.caffeine_mg ?? ''}
                      onChange={e => handleCoffeeDraftChange('caffeine_mg', e.target.value ? Number(e.target.value) : null)}
                      placeholder="e.g. 150"
                      className="w-full h-[46px] px-4 text-[14px] text-[#111] placeholder-[#AAA] border border-[#DDD] rounded-[12px] outline-none focus:border-[#111] transition-colors"
                    />
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-[12px] font-semibold text-[#333] uppercase tracking-[0.05em] mb-2">Calories</label>
                      <input
                        type="number"
                        value={coffeeDraft.calories ?? ''}
                        onChange={e => handleCoffeeDraftChange('calories', e.target.value ? Number(e.target.value) : null)}
                        placeholder="e.g. 250"
                        className="w-full h-[46px] px-4 text-[14px] text-[#111] placeholder-[#AAA] border border-[#DDD] rounded-[12px] outline-none focus:border-[#111] transition-colors"
                      />
                    </div>
                    <div className="flex items-end pb-3">
                      <label className="inline-flex items-center gap-2 cursor-pointer whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={!!coffeeDraft.shareable}
                          onChange={e => handleCoffeeDraftChange('shareable', e.target.checked ? 1 : 0)}
                          className="w-[18px] h-[18px] rounded border-[#DDD] cursor-pointer accent-black"
                        />
                        <span className="text-[13px] text-[#555]">Shareable</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>


              {/* Divider */}
              <div className="border-t border-[#F0F0F0]" />

              {/* 2-Column Grid: Category & Sub-Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[#333] uppercase tracking-[0.05em] mb-2">Category</label>
                  <select
                    value={coffeeDraft.category_id || ''}
                    onChange={e => handleCoffeeDraftChange('category_id', e.target.value)}
                    className="w-full h-[46px] px-4 text-[14px] text-[#111] border border-[#DDD] rounded-[12px] outline-none focus:border-[#111] bg-white cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_16px_center] bg-no-repeat transition-colors"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    <option value="__NEW__">+ Create new</option>
                  </select>
                  {coffeeDraft.category_id === '__NEW__' && (
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      placeholder="New category name"
                      className="mt-2 w-full h-[46px] px-4 text-[14px] text-[#111] placeholder-[#AAA] border border-[#DDD] rounded-[12px] outline-none focus:border-[#111] transition-colors"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#333] uppercase tracking-[0.05em] mb-2">Sub-category</label>
                  <select
                    value={coffeeDraft.sub_category_id || ''}
                    onChange={e => handleCoffeeDraftChange('sub_category_id', e.target.value)}
                    disabled={!coffeeDraft.category_id}
                    className="w-full h-[46px] px-4 text-[14px] text-[#111] border border-[#DDD] rounded-[12px] outline-none focus:border-[#111] bg-white cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_16px_center] bg-no-repeat disabled:bg-[#F5F5F5] disabled:text-[#999] disabled:cursor-not-allowed transition-colors"
                  >
                    <option value="">Select sub-category</option>
                    {subCategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                    <option value="__NEW__">+ Create new</option>
                  </select>
                  {coffeeDraft.sub_category_id === '__NEW__' && (
                    <input
                      type="text"
                      value={newSubCategoryName}
                      onChange={e => setNewSubCategoryName(e.target.value)}
                      placeholder="New sub-category name"
                      className="mt-2 w-full h-[46px] px-4 text-[14px] text-[#111] placeholder-[#AAA] border border-[#DDD] rounded-[12px] outline-none focus:border-[#111] transition-colors"
                    />
                  )}
                </div>
              </div>


              {/* Divider */}
              <div className="border-t border-[#F0F0F0]" />

              {/* Image URL */}
              <div>
                <label className="block text-[12px] font-semibold text-[#333] uppercase tracking-[0.05em] mb-2">Image URL</label>
                <input
                  type="text"
                  value={coffeeDraft.image || ''}
                  onChange={e => handleCoffeeDraftChange('image', e.target.value)}
                  placeholder="/media/pic1.jpeg"
                  className="w-full h-[46px] px-4 text-[14px] text-[#111] placeholder-[#AAA] border border-[#DDD] rounded-[12px] outline-none focus:border-[#111] transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[12px] font-semibold text-[#333] uppercase tracking-[0.05em] mb-2">Description</label>
                <textarea
                  value={coffeeDraft.description || ''}
                  onChange={e => handleCoffeeDraftChange('description', e.target.value)}
                  placeholder="Brief description for staff and customers..."
                  rows={3}
                  className="w-full px-4 py-3 text-[14px] text-[#111] placeholder-[#AAA] border border-[#DDD] rounded-[12px] outline-none focus:border-[#111] resize-none transition-colors"
                />
              </div>

              {/* Tags */}
              <div className="relative">
                <label className="block text-[12px] font-semibold text-[#333] uppercase tracking-[0.05em] mb-2">Tags</label>


                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedTags.map(tag => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F5] rounded-[8px] text-[13px] text-[#333]"
                      >
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => setSelectedTags(prev => prev.filter(t => t.id !== tag.id))}
                          className="text-[#999] hover:text-[#111]"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Tag Search */}
                <input
                  type="text"
                  value={tagSearchQuery}
                  onChange={e => {
                    setTagSearchQuery(e.target.value);
                    setShowTagDropdown(true);
                  }}
                  onFocus={() => setShowTagDropdown(true)}
                  placeholder="Search or create tags..."
                  className="w-full h-[46px] px-4 text-[14px] text-[#111] placeholder-[#AAA] border border-[#DDD] rounded-[12px] outline-none focus:border-[#111] transition-colors"
                />

                {/* Tag Dropdown */}
                {showTagDropdown && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-black/10 rounded-[8px] shadow-lg max-h-[200px] overflow-y-auto">
                    {allTags
                      .filter(tag =>
                        tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase()) &&
                        !selectedTags.some(st => st.id === tag.id)
                      )
                      .slice(0, 8)
                      .map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            setSelectedTags(prev => [...prev, tag]);
                            setTagSearchQuery('');
                            setShowTagDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#FAFAFA] transition-colors"
                        >
                          {tag.name}
                        </button>
                      ))}

                    {(tagSearchQuery ?? '').trim() && !allTags.some(t =>
                      t.name.toLowerCase() === (tagSearchQuery ?? '').trim().toLowerCase()
                    ) && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const trimmedTag = (tagSearchQuery ?? '').trim();
                              const res = await fetch(`${API_BASE_URL}/api/tags`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ name: trimmedTag })
                              });
                              if (res.ok) {
                                const newTag = await res.json();
                                setAllTags(prev => [...prev, newTag]);
                                setSelectedTags(prev => [...prev, newTag]);
                                setTagSearchQuery('');
                                setShowTagDropdown(false);
                              }
                            } catch (err) {
                              console.error('Error creating tag:', err);
                            }
                          }}
                          className="w-full text-left px-4 py-2.5 text-[13px] text-blue-600 hover:bg-blue-50 transition-colors border-t border-black/5"
                        >
                          + Create "{(tagSearchQuery ?? '').trim()}"
                        </button>
                      )}

                    <button
                      type="button"
                      onClick={() => setShowTagDropdown(false)}
                      className="w-full text-left px-4 py-2 text-[12px] text-zinc-400 hover:bg-[#FAFAFA] border-t border-black/5"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="px-8 py-5 bg-[#FAFAFA] border-t border-[#EBEBEB] flex justify-end gap-3">
              <button
                onClick={closeCoffeeModal}
                className="h-[42px] px-5 text-[14px] font-medium text-[#555] hover:text-[#111] hover:bg-[#F0F0F0] rounded-[10px] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveCoffeeItem}
                className="h-[42px] px-6 text-[14px] font-medium text-white bg-[#111] hover:bg-black rounded-[10px] transition-colors"
              >
                {editingCoffee ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </motion.div>
        </div >
      )}

      {
        artModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-xl bg-[#F9F8F4] border border-black/10 rounded-xl shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-serif italic text-black">{editingArt ? 'Edit Art Piece' : 'Upload Art'}</h2>
                <button onClick={closeArtModal} className="text-xs uppercase tracking-[0.25em] text-zinc-400 hover:text-black transition-colors">Close</button>
              </div>

              <div className="space-y-6 font-sans text-sm">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2">Title</label>
                  <input
                    value={artDraft.title || ''}
                    onChange={e => handleArtDraftChange('title', e.target.value)}
                    className="w-full bg-transparent border-b border-black/10 py-3 text-lg outline-none focus:border-black transition-colors placeholder-zinc-300"
                    placeholder="e.g. Midnight Bloom"
                  />
                </div>

                {/* Artist Removed */}

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2">Price (₹)</label>
                    <input
                      type="number"
                      value={artDraft.price ?? ''}
                      onChange={e => handleArtDraftChange('price', Number(e.target.value))}
                      className="w-full bg-transparent border-b border-black/10 py-2 outline-none focus:border-black font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2">Stock</label>
                    <input
                      type="number"
                      value={artDraft.stock ?? ''}
                      onChange={e => handleArtDraftChange('stock', Number(e.target.value))}
                      className="w-full bg-transparent border-b border-black/10 py-2 outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-3">Artwork Image</label>

                  <div className="flex items-start gap-4">
                    {/* Preview */}
                    <div className="w-24 h-24 bg-zinc-100 rounded-lg overflow-hidden border border-black/5 flex-shrink-0">
                      <img
                        src={selectedFile ? URL.createObjectURL(selectedFile) : artDraft.image || '/media/pic1.jpeg'}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setSelectedFile(e.target.files[0]);
                          }
                        }}
                        className="block w-full text-xs text-zinc-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-[10px] file:uppercase file:tracking-[0.1em]
                            file:bg-black file:text-white
                            hover:file:bg-zinc-800
                            cursor-pointer"
                      />
                      <p className="mt-2 text-[10px] text-zinc-400">Upload a high quality JPEG or PNG. Max 5MB.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-8 text-[11px] uppercase tracking-[0.25em]">
                  <button onClick={closeArtModal} className="px-6 py-3 text-zinc-400 hover:text-black transition-colors">Cancel</button>
                  <button onClick={saveArtItem} className="px-8 py-3 bg-black text-white hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl">
                    {editingArt ? 'Save Changes' : 'Upload Piece'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )
      }

      {/* Delete confirmation modal */}
      {
        deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="w-full max-w-sm bg-white rounded-xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-serif mb-2">Delete Item?</h2>
              <p className="text-sm text-zinc-500 font-sans mb-4">
                This action cannot be undone.
              </p>
              {itemToDelete && (
                <p className="text-sm font-serif mb-6">"{(itemToDelete as any).title || (itemToDelete as any).name}"</p>
              )}
              <div className="flex justify-end gap-3 text-[11px] uppercase tracking-[0.25em]">
                <button
                  onClick={cancelDeleteCoffeeItem}
                  className="px-4 py-2 text-zinc-500 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-5 py-2 bg-[#0a0a0a] text-[#F9F8F4] rounded-full transform transition-transform hover:scale-105"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )
      }

      {/* Toast notifications */}
      {
        toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-8 left-1/2 z-[100] flex items-center gap-4 px-8 py-4 bg-[#F9F8F4] border border-black/10 rounded-2xl shadow-2xl backdrop-blur-md ${toast.type === 'success' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-red-500'
              }`}
          >
            <div className={`p-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-100/50 text-emerald-600' : 'bg-red-100/50 text-red-600'}`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold">
                {toast.type === 'success' ? 'Success' : 'Error'}
              </span>
              <span className="text-sm font-serif text-black">{toast.message}</span>
            </div>
          </motion.div>
        )
      }
    </div >
  );
};

// Overview card
const OverviewCard: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="bg-white border border-black/5 rounded-xl p-6 flex flex-col justify-between min-h-[140px]">
    <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500 font-sans mb-2">
      {label}
    </p>
    <p className="text-4xl font-serif italic">{value}</p>
  </div>
);

// Coffee table
const CoffeeTable: React.FC<{
  items: CoffeeAdminItem[];
  onEdit: (item: CoffeeAdminItem) => void;
  onDelete: (id: string) => void;
}> = ({ items, onEdit, onDelete }) => (
  <div className="bg-white border border-black/5 rounded-xl overflow-hidden">
    <table className="w-full text-left font-sans text-sm">
      <thead className="bg-[#F9F8F4] text-[10px] uppercase tracking-[0.25em] text-zinc-500">
        <tr>
          <th className="px-6 py-3 font-semibold">Item</th>
          <th className="px-6 py-3 font-semibold">Category</th>
          <th className="px-6 py-3 font-semibold">Price (₹)</th>
          <th className="px-6 py-3 font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr
            key={item.id}
            className="border-t border-black/5 hover:bg-[#F9F8F4]/60 transition-colors"
          >
            <td className="px-6 py-4">
              <span className="font-medium text-[15px]">{item.name}</span>
            </td>
            <td className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-zinc-700">
              {item.category}
            </td>
            <td className="px-6 py-4 text-sm font-semibold">₹{item.price}</td>
            <td className="px-6 py-4">
              <div className="flex gap-3 text-xs uppercase tracking-[0.2em]">
                <button
                  onClick={() => onEdit(item)}
                  className="flex items-center gap-1 text-zinc-600 hover:text-black"
                >
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="flex items-center gap-1 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Orders table
const OrdersTable: React.FC<{ items: Order[] }> = ({ items }) => (
  <div className="bg-white border border-black/5 rounded-xl overflow-hidden">
    <table className="w-full text-left font-sans text-sm">
      <thead className="bg-[#F9F8F4] text-[10px] uppercase tracking-[0.25em] text-zinc-500">
        <tr>
          <th className="px-6 py-3 font-semibold">Order ID</th>
          <th className="px-6 py-3 font-semibold">Customer</th>
          <th className="px-6 py-3 font-semibold">Phone</th>
          <th className="px-6 py-3 font-semibold">Items</th>
          <th className="px-6 py-3 font-semibold">Total (₹)</th>
          <th className="px-6 py-3 font-semibold">Payment</th>
          <th className="px-6 py-3 font-semibold">Pickup Time</th>
          <th className="px-6 py-3 font-semibold">Date</th>
        </tr>
      </thead>
      <tbody>
        {items.map(order => (
          <tr
            key={order.id}
            className="border-t border-black/5 hover:bg-[#F9F8F4]/60 transition-colors"
          >
            <td className="px-6 py-4 text-xs font-mono">{order.id}</td>
            <td className="px-6 py-4 text-sm">{order.customer.name}</td>
            <td className="px-6 py-4 text-sm text-zinc-700">{order.customer.phone}</td>
            <td className="px-6 py-4 text-sm text-zinc-700">{order.items.length}</td>
            <td className="px-6 py-4 text-sm font-semibold">₹{order.total.toFixed(0)}</td>
            <td className="px-6 py-4 text-xs font-sans uppercase tracking-[0.1em] text-zinc-600">
              {order.payment_method?.includes('Counter') ? 'Counter' : (order.payment_method?.includes('Online') ? 'Online' : order.payment_method || 'Counter')}
            </td>
            <td className="px-6 py-4 text-sm text-zinc-700">{order.pickupTime}</td>
            <td className="px-6 py-4 text-xs text-zinc-500">
              {order.date}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Art table
const ArtTable: React.FC<{
  items: ArtAdminItem[];
  onToggleStatus: (id: string) => void;
  onEdit: (item: ArtAdminItem) => void;
  onDelete: (id: string) => void;
}> = ({ items, onToggleStatus, onEdit, onDelete }) => (
  <div className="bg-white border border-black/5 rounded-xl overflow-hidden">
    <table className="w-full text-left font-sans text-sm">
      <thead className="bg-[#F9F8F4] text-[10px] uppercase tracking-[0.25em] text-zinc-500">
        <tr>
          <th className="px-6 py-3 font-semibold">Artwork</th>
          <th className="px-6 py-3 font-semibold">Price (₹)</th>
          <th className="px-6 py-3 font-semibold">Stock</th>
          <th className="px-6 py-3 font-semibold">Status</th>
          <th className="px-6 py-3 font-semibold">Action</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr
            key={item.id}
            className="border-t border-black/5 hover:bg-[#F9F8F4]/60 transition-colors"
          >
            <td className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-md overflow-hidden bg-zinc-200">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-[15px]">{item.title}</span>
                  <span className="text-[11px] text-zinc-500 uppercase tracking-[0.2em]">
                    #{item.id}
                  </span>
                </div>
              </div>
            </td>
            {/* Artist Column Removed */}
            <td className="px-6 py-4 text-sm font-semibold">₹{item.price}</td>
            <td className="px-6 py-4 text-sm text-zinc-700">{item.stock ?? 1}</td>
            <td className="px-6 py-4">
              <button
                onClick={() => onToggleStatus(item.id)}
                className={`px-3 py-1 text-[10px] uppercase tracking-[0.2em] rounded-full border ${item.status === 'Available'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-zinc-300 bg-zinc-100 text-zinc-600'
                  }`}
              >
                {item.status}
              </button>
            </td>
            <td className="px-6 py-4">
              <div className="flex gap-3 text-xs uppercase tracking-[0.2em]">
                <button
                  onClick={() => onEdit(item)}
                  className="flex items-center gap-1 text-zinc-600 hover:text-black"
                >
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="flex items-center gap-1 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Workshop table
const WorkshopTable: React.FC<{ items: WorkshopAdminItem[] }> = ({ items }) => (
  <div className="bg-white border border-black/5 rounded-xl overflow-hidden">
    <table className="w-full text-left font-sans text-sm">
      <thead className="bg-[#F9F8F4] text-[10px] uppercase tracking-[0.25em] text-zinc-500">
        <tr>
          <th className="px-6 py-3 font-semibold">Title</th>
          <th className="px-6 py-3 font-semibold">Date / Time</th>
          <th className="px-6 py-3 font-semibold">Seats</th>
          <th className="px-6 py-3 font-semibold">Price (₹)</th>
          <th className="px-6 py-3 font-semibold">Registrations</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr
            key={item.id}
            className="border-t border-black/5 hover:bg-[#F9F8F4]/60 transition-colors"
          >
            <td className="px-6 py-4 font-medium text-[15px]">{item.title}</td>
            <td className="px-6 py-4 text-sm text-zinc-700">{item.datetime}</td>
            <td className="px-6 py-4 text-sm text-zinc-700">
              {item.booked}/{item.seats}
            </td>
            <td className="px-6 py-4 text-sm font-semibold">₹{item.price}</td>
            <td className="px-6 py-4">
              <button className="px-4 py-2 text-[10px] uppercase tracking-[0.25em] border border-black/20 rounded-full hover:bg-[#F9F8F4]">
                View Registrations
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Franchise table
const FranchiseTable: React.FC<{
  items: FranchiseEnquiry[];
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (item: FranchiseEnquiry) => void;
}> = ({ items, onMarkRead, onDelete, onView }) => {
  const [statusFilter, setStatusFilter] = useState('New');
  const tabs = ['New', 'Contacted', 'In Progress', 'Converted', 'Closed'];

  const filteredItems = items.filter(i => (i.status || 'New') === statusFilter);

  return (
    <div className="bg-white border border-black/5 rounded-xl overflow-hidden flex flex-col h-full min-h-[500px]">
      {/* Status Tabs */}
      <div className="flex border-b border-black/5 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold border-b-2 transition-colors whitespace-nowrap ${statusFilter === tab
              ? 'border-black text-black'
              : 'border-transparent text-zinc-400 hover:text-zinc-600'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <table className="w-full text-left font-sans text-sm">
        <thead className="bg-[#F9F8F4] text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          <tr>
            <th className="px-6 py-3 font-semibold">Name</th>
            <th className="px-6 py-3 font-semibold">Contact</th>
            <th className="px-6 py-3 font-semibold">Email</th>
            <th className="px-6 py-3 font-semibold">Preview</th>
            <th className="px-6 py-3 font-semibold">Date</th>
            <th className="px-6 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map(item => (
            <tr
              key={item.id}
              onClick={() => onView(item)}
              className="border-t border-black/5 hover:bg-[#F9F8F4]/60 transition-colors cursor-pointer group"
            >
              <td className="px-6 py-4">
                <span className="font-medium text-[15px]">{item.full_name}</span>
              </td>
              <td className="px-6 py-4 text-sm text-zinc-700">{item.contact_number}</td>
              <td className="px-6 py-4 text-sm text-zinc-700">{item.email}</td>
              <td className="px-6 py-4 text-sm text-zinc-500 block max-w-xs truncate group-hover:text-black transition-colors">{item.enquiry}</td>
              <td className="px-6 py-4 text-sm text-zinc-700">{new Date(item.created_at).toLocaleDateString()}</td>
              <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                <div className="flex gap-3 text-xs uppercase tracking-[0.2em]">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-red-500 hover:text-red-600 px-3 py-1 border border-red-100 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {filteredItems.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-20 text-center text-zinc-400 font-sans">
                No enquiries in "{statusFilter}".
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const EnquiryDetailModal: React.FC<{
  enquiry: FranchiseEnquiry;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
}> = ({ enquiry, onClose, onUpdateStatus }) => {
  const [status, setStatus] = useState(enquiry.status || 'New');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-black/5 flex justify-between items-center bg-[#F9F8F4]">
          <div>
            <h2 className="text-xl font-serif">Enquiry Details</h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">ID: {enquiry.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full text-zinc-500 hover:text-black transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto font-sans space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Full Name</label>
              <p className="text-lg font-medium">{enquiry.full_name}</p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Submitted On</label>
              <p className="text-lg text-zinc-700">{new Date(enquiry.created_at).toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Email</label>
              <p className="text-lg text-zinc-700">{enquiry.email}</p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Contact Number</label>
              <p className="text-lg text-zinc-700">{enquiry.contact_number}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-4 bg-zinc-50 p-2 inline-block rounded">Message</label>
            <div className="text-base leading-relaxed text-zinc-800 whitespace-pre-wrap bg-zinc-50 p-6 rounded-xl border border-black/5">
              {enquiry.enquiry}
            </div>
          </div>

          <div className="pt-6 border-t border-black/5">
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-4">Pipeline Status</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-zinc-50 border border-black/10 px-4 py-3 rounded-lg appearance-none outline-none focus:border-black transition-colors font-sans text-sm"
              >
                {['New', 'Contacted', 'In Progress', 'Converted', 'Closed'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-zinc-50 border-t border-black/5 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 text-zinc-500 hover:text-black text-xs uppercase tracking-widest font-bold">Close</button>
          <button
            onClick={() => onUpdateStatus(enquiry.id, status)}
            className="px-8 py-3 bg-black text-white text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-zinc-800 shadow-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const FranchiseSettingsManager: React.FC<{
  contactNumber: string;
  onSave: (val: string) => void;
}> = ({ contactNumber, onSave }) => {
  const [val, setVal] = useState(contactNumber);
  useEffect(() => { setVal(contactNumber) }, [contactNumber]);

  return (
    <div className="bg-white border border-black/5 rounded-xl p-8 max-w-xl">
      <h3 className="text-2xl font-serif mb-6">Contact Settings</h3>
      <div className="mb-6">
        <label className="block text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">Franchise Phone Number</label>
        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-full bg-zinc-50 border border-black/10 px-4 py-3 rounded outline-none focus:border-black transition-colors"
          placeholder="+91..."
        />
        <p className="text-[10px] text-zinc-400 mt-2">This number will be displayed on the Franchise page.</p>
      </div>
      <button
        onClick={() => onSave(val)}
        className="px-6 py-3 bg-black text-white text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
      >
        Save Changes
      </button>
    </div>
  );
};

const FranchiseFaqManager: React.FC<{
  items: FranchiseFaqItem[];
  onAdd: (q: string, a: string) => void;
  onDelete: (id: number) => void;
}> = ({ items, onAdd, onDelete }) => {
  const [q, setQ] = useState('');
  const [a, setA] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q || !a) return;
    onAdd(q, a);
    setQ('');
    setA('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* List */}
      <div className="space-y-4">
        <h3 className="text-xl font-serif mb-4">Existing FAQs</h3>
        {items.length === 0 && <p className="text-zinc-400 text-sm">No FAQs added yet.</p>}
        {items.map(item => (
          <div key={item.id} className="bg-white border border-black/5 p-6 rounded-xl relative group">
            <button
              onClick={() => onDelete(item.id)}
              className="absolute top-4 right-4 text-zinc-300 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <h4 className="font-serif font-bold mb-2 pr-8">{item.question}</h4>
            <p className="text-sm text-zinc-600 font-sans">{item.answer}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <div>
        <h3 className="text-xl font-serif mb-4">Add New FAQ</h3>
        <div className="bg-white border border-black/5 p-8 rounded-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">Question</label>
              <input
                className="w-full bg-zinc-50 border border-black/10 px-4 py-2 rounded outline-none focus:border-black"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="e.g. What is the investment?"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">Answer</label>
              <textarea
                className="w-full bg-zinc-50 border border-black/10 px-4 py-2 rounded outline-none focus:border-black min-h-[100px]"
                value={a}
                onChange={e => setA(e.target.value)}
                placeholder="Enter detailed answer..."
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-black text-white text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
            >
              Add FAQ
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
