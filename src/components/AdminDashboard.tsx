
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
} from 'lucide-react';
import {
  useDataContext,
  CoffeeAdminItem,
  ArtAdminItem,
  WorkshopAdminItem,
  Order,
} from '../DataContext';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'coffee' | 'orders' | 'art' | 'workshops' | 'franchise_enquiries' | 'franchise_faqs' | 'franchise_settings'>('overview');
  const [isFranchiseOpen, setIsFranchiseOpen] = useState(false);

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'coffee' as const, label: 'Menu', icon: Coffee },
    { id: 'orders' as const, label: 'Orders', icon: ClipboardList },
    { id: 'art' as const, label: 'Art Gallery', icon: Palette },
    { id: 'workshops' as const, label: 'Workshops', icon: Calendar },
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


  // Dynamically derive available categories from current menu items
  const categoryOptions = useMemo(
    () => Array.from(new Set(menuItems.map(item => item.category).filter(Boolean))).sort() as string[],
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
    const defaultCategory = categoryOptions[0] || 'Robusta Specialty (Cold - Non Milk)';
    setItemKind('beverage');
    setCoffeeDraft({
      name: '',
      description: '',
      category: defaultCategory,
      price: 0,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      caffeine_mg: null,
      milk_based: 0,
      calories: null,
      shareable: 0,
      intensity_level: null,
      tags: '',
    });
    setCoffeeModalOpen(true);
  };

  const openCoffeeModalForEdit = (item: CoffeeAdminItem) => {
    setEditingCoffee(item);
    setNewCategoryName('');
    const isFoodCategory = item.category?.trim().toUpperCase().includes('FOOD') || false;
    setItemKind(isFoodCategory ? 'food' : 'beverage');
    setCoffeeDraft(item);
    setCoffeeModalOpen(true);
  };

  const closeCoffeeModal = () => {
    setCoffeeModalOpen(false);
  };

  const handleCoffeeDraftChange = (field: keyof CoffeeAdminItem, value: any) => {
    setCoffeeDraft(prev => ({ ...prev, [field]: value }));
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

  const saveCoffeeItem = () => {
    if (!coffeeDraft.name || !coffeeDraft.category || coffeeDraft.price == null) return;

    const draftName = (coffeeDraft.name ?? '').trim();

    // Resolve final category (including __NEW__) and normalize to uppercase
    const isNewCategory = coffeeDraft.category === '__NEW__';
    const trimmedNewCategory = (newCategoryName ?? '').trim();
    const rawCategory = isNewCategory
      ? trimmedNewCategory
      : (coffeeDraft.category as string);
    const finalCategory = rawCategory ? rawCategory.toUpperCase() : '';

    if (!finalCategory) return;

    const currentId = editingCoffee ? editingCoffee.id : null;
    const nameExistsInCategory = menuItems.some(item =>
      item.id !== currentId &&
      item.name?.trim().toLowerCase() === draftName.toLowerCase() &&
      item.category?.trim().toLowerCase() === finalCategory.toLowerCase()
    );

    if (nameExistsInCategory) {
      showToast('An item with this name already exists in this category.', 'error');
      return;
    }

    console.log("Saving coffee item", coffeeDraft);

    // Normalise boolean-like fields to 0/1 integers for the database schema
    const normalizedDraft: Partial<CoffeeAdminItem> = {
      ...coffeeDraft,
      name: draftName,
      category: finalCategory,
      price: Number(coffeeDraft.price),
      milk_based:
        itemKind === 'beverage'
          ? (coffeeDraft.milk_based ? 1 : 0)
          : null,
      calories:
        itemKind === 'food'
          ? (coffeeDraft.calories != null ? Number(coffeeDraft.calories) : null)
          : null,
      shareable:
        itemKind === 'food'
          ? (coffeeDraft.shareable ? 1 : 0)
          : null,
      caffeine_mg:
        itemKind === 'beverage'
          ? (coffeeDraft.caffeine_mg != null ? Number(coffeeDraft.caffeine_mg) : null)
          : null,
    };

    if (editingCoffee) {
      updateMenuItem(editingCoffee.id, normalizedDraft);
      showToast('Item updated successfully', 'success');
    } else {
      const newItem: CoffeeAdminItem = {
        id: `c${Date.now()}`,
        name: draftName,
        category: finalCategory,
        price: Number(coffeeDraft.price),
        caffeine: coffeeDraft.caffeine || 'High',
        caffeine_mg: normalizedDraft.caffeine_mg ?? null,
        milk_based: normalizedDraft.milk_based ?? null,
        calories: normalizedDraft.calories ?? null,
        shareable: normalizedDraft.shareable ?? null,
        intensity_level: coffeeDraft.intensity_level ?? null,
        image: coffeeDraft.image || '/media/pic1.jpeg',
        description: coffeeDraft.description || '',
        tags: coffeeDraft.tags || '',
      };
      console.log("Adding new coffee item", newItem);
      addMenuItem(newItem);
      showToast('Item added successfully', 'success');
    }

    setCoffeeModalOpen(false);
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

  const activeTabLabel = tabs.find(t => t.id === activeTab)?.label;

  // Classification helpers for beverages vs food based on category naming
  const foodItems = menuItems.filter(item => item.category?.trim().toUpperCase().includes('FOOD'));
  const beverageItems = menuItems.filter(item => !item.category?.trim().toUpperCase().includes('FOOD'));
  const beverageCount = beverageItems.length;
  const foodCount = foodItems.length;
  const enquiryCount = enquiries.length;

  return (
    <div className="flex h-screen bg-[#F9F8F4] pt-10 text-[#0a0a0a]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-black/5 px-6 pt-10 pb-6 flex flex-col bg-white/80">
        <div className="mb-6 text-[#0a0a0a]">
          <p className="text-3xl font-serif font-bold text-black">Admin Panel</p>
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
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-left transition-all border-l-2 ${activeTab === tab.id
                ? 'border-black font-semibold text-[#0a0a0a]'
                : 'border-transparent text-zinc-500 hover:text-[#0a0a0a] hover:border-black/10'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}

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
                      onClick={() => setActiveTab(sub.id as any)}
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

        {/* Rabuste logo near bottom, above Exit button */}
        <div className="mt-auto mb-12 px-3 flex items-center justify-center">
          <img
            src="/media/logo.png"
            alt="Rabuste Coffee Logo"
            className="h-24 w-auto object-contain mx-auto brightness-0"
          />
        </div>

        <button
          onClick={() => {
            onLogout();
            onBack();
          }}
          className="flex items-center space-x-2 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500 hover:text-red-500 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Dashboard</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif italic tracking-tight mb-3">
              {activeTabLabel}
            </h1>
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-zinc-500 font-sans">
              Rabuste Coffee — Internal Console
            </p>
          </div>

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

      {/* Coffee modal */}
      {coffeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl bg-[#F9F8F4] border border-black/10 rounded-xl shadow-xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif italic">{editingCoffee ? 'Edit Item' : 'Add New Item'}</h2>
              <button
                onClick={closeCoffeeModal}
                className="text-xs uppercase tracking-[0.25em] text-zinc-500 hover:text-black"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 font-sans text-sm">
              {/* Item Kind - UI-only classification */}
              <div>
                <label className="block text-[11px] uppercase tracking-[0.25em] mb-1">Item Kind</label>
                <div className="flex gap-4 text-[12px]">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      checked={itemKind === 'beverage'}
                      onChange={() => setItemKind('beverage')}
                    />
                    <span>Beverage</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      checked={itemKind === 'food'}
                      onChange={() => setItemKind('food')}
                    />
                    <span>Food</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.25em] mb-1">Name</label>
                <input
                  value={coffeeDraft.name || ''}
                  onChange={e => handleCoffeeDraftChange('name', e.target.value)}
                  className="w-full bg-transparent border-b border-black/20 py-2 text-sm outline-none focus:border-black"
                  placeholder="Robusta Mocha"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.25em] mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={coffeeDraft.price ?? ''}
                    onChange={e => handleCoffeeDraftChange('price', Number(e.target.value))}
                    className="w-full bg-transparent border-b border-black/20 py-2 text-sm outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.25em] mb-1">Category</label>
                  <select
                    value={coffeeDraft.category || categoryOptions[0] || ''}
                    onChange={e => handleCoffeeDraftChange('category', e.target.value as any)}
                    className="w-full bg-transparent border-b border-black/20 py-2 text-sm outline-none focus:border-black"
                  >
                    {categoryOptions.map(category => (
                      <option key={category} value={category}>
                        {category?.toUpperCase() || category}
                      </option>
                    ))}
                    <option value="__NEW__">Create New Category</option>
                  </select>
                  {coffeeDraft.category === '__NEW__' && (
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      placeholder="New category name"
                      className="mt-2 w-full bg-transparent border-b border-black/20 py-2 text-sm outline-none focus:border-black"
                    />
                  )}
                </div>
              </div>

              {/* Beverage-specific fields */}
              {itemKind === 'beverage' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.25em] mb-1">Caffeine (mg)</label>
                    <input
                      type="number"
                      value={coffeeDraft.caffeine_mg ?? ''}
                      onChange={e => handleCoffeeDraftChange('caffeine_mg', e.target.value ? Number(e.target.value) : null)}
                      className="w-full bg-transparent border-b border-black/20 py-2 text-sm outline-none focus:border-black"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-4 md:pt-6">
                    <input
                      type="checkbox"
                      checked={!!coffeeDraft.milk_based}
                      onChange={e => handleCoffeeDraftChange('milk_based', e.target.checked ? 1 : 0)}
                    />
                    <span className="text-[11px] uppercase tracking-[0.25em]">Contains Milk</span>
                  </div>
                </div>
              )}

              {/* Food-specific fields */}
              {itemKind === 'food' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.25em] mb-1">Calories (per serving)</label>
                    <input
                      type="number"
                      value={coffeeDraft.calories ?? ''}
                      onChange={e => handleCoffeeDraftChange('calories', e.target.value ? Number(e.target.value) : null)}
                      className="w-full bg-transparent border-b border-black/20 py-2 text-sm outline-none focus:border-black"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-4 md:pt-6">
                    <input
                      type="checkbox"
                      checked={!!coffeeDraft.shareable}
                      onChange={e => handleCoffeeDraftChange('shareable', e.target.checked ? 1 : 0)}
                    />
                    <span className="text-[11px] uppercase tracking-[0.25em]">Good for Sharing</span>
                  </div>
                </div>
              )}

              {/* Shared fields */}
              <div>
                <label className="block text-[11px] uppercase tracking-[0.25em] mb-1">Image</label>
                <input
                  value={coffeeDraft.image || ''}
                  onChange={e => handleCoffeeDraftChange('image', e.target.value)}
                  className="w-full bg-transparent border-b border-black/20 py-2 text-sm outline-none focus:border-black"
                  placeholder="/media/pic1.jpeg"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.25em] mb-1">Description</label>
                <textarea
                  value={coffeeDraft.description || ''}
                  onChange={e => handleCoffeeDraftChange('description', e.target.value)}
                  className="w-full bg-transparent border-b border-black/20 py-2 text-sm outline-none focus:border-black min-h-[60px]"
                  placeholder="Short description for staff and baristas"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.25em] mb-1">Tags</label>
                <input
                  value={coffeeDraft.tags || ''}
                  onChange={e => handleCoffeeDraftChange('tags', e.target.value)}
                  className="w-full bg-transparent border-b border-black/20 py-2 text-sm outline-none focus:border-black"
                  placeholder="cold, strong, black, robusta"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4 text-[11px] uppercase tracking-[0.25em]">
                <button
                  onClick={closeCoffeeModal}
                  className="px-4 py-2 text-zinc-500 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCoffeeItem}
                  className="px-6 py-2 bg-[#0a0a0a] text-[#F9F8F4] hover:bg-black"
                >
                  Save Item
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      {artModalOpen && (
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
      )}

      {/* Delete confirmation modal */}
      {deleteModalOpen && (
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
      )}

      {/* Toast notifications */}
      {toast.show && (
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
      )}
    </div>
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
