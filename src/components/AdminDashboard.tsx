
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import {
  useDataContext,
  CoffeeAdminItem,
  ArtAdminItem,
  WorkshopAdminItem,
  Order,
} from '../DataContext';


interface AdminDashboardProps {
  onBack: () => void;
  onLogout: () => void;
}

interface FranchiseEnquiry {
  id: string;
  name: string;
  contact: string;
  location: string;
  date: string;
  read: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'coffee' | 'orders' | 'art' | 'workshops' | 'franchise'>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'coffee' as const, label: 'Coffee Menu', icon: Coffee },
    { id: 'orders' as const, label: 'Orders', icon: ClipboardList },
    { id: 'art' as const, label: 'Art Gallery', icon: Palette },
    { id: 'workshops' as const, label: 'Workshops', icon: Calendar },
    { id: 'franchise' as const, label: 'Franchise Enquiries', icon: Users },
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
    () => Array.from(new Set(menuItems.map(item => item.category))).sort(),
    [menuItems]
  );

  // Dummy initial data – structured for easy API replacement later
  // Removed hardcoded coffeeItems - using useDataContext() instead


  // artItems and workshops now come from DataContext (see useDataContext above)

  // Removed hardcoded enquiries
  const [enquiries, setEnquiries] = useState<FranchiseEnquiry[]>([]);

  // Modal state for Coffee items
  const [coffeeModalOpen, setCoffeeModalOpen] = useState(false);
  const [editingCoffee, setEditingCoffee] = useState<CoffeeAdminItem | null>(null);
  const [coffeeDraft, setCoffeeDraft] = useState<Partial<CoffeeAdminItem>>({});
  const [newCategoryName, setNewCategoryName] = useState('');

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
      const res = await fetch('http://localhost:5000/api/upload', {
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
    if (!artDraft.title || artDraft.price == null) {
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
    setCoffeeDraft({
      name: '',
      description: '',
      category: defaultCategory,
      price: 0,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
    });
    setCoffeeModalOpen(true);
  };

  const openCoffeeModalForEdit = (item: CoffeeAdminItem) => {
    setEditingCoffee(item);
    setNewCategoryName('');
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

    const draftName = (coffeeDraft.name as string).trim();

    // Resolve final category (including __NEW__) and normalize to uppercase
    const isNewCategory = coffeeDraft.category === '__NEW__';
    const trimmedNewCategory = newCategoryName.trim();
    const rawCategory = isNewCategory
      ? trimmedNewCategory
      : (coffeeDraft.category as string);
    const finalCategory = rawCategory ? rawCategory.toUpperCase() : '';

    if (!finalCategory) return;

    const currentId = editingCoffee ? editingCoffee.id : null;
    const nameExistsInCategory = menuItems.some(item =>
      item.id !== currentId &&
      item.name.trim().toLowerCase() === draftName.toLowerCase() &&
      item.category.trim().toLowerCase() === finalCategory.toLowerCase()
    );

    if (nameExistsInCategory) {
      showToast('An item with this name already exists in this category.', 'error');
      return;
    }

    if (editingCoffee) {
      updateMenuItem(editingCoffee.id, {
        ...coffeeDraft, // Send all fields in draft to avoid data loss
        name: draftName,
        category: finalCategory,
        price: Number(coffeeDraft.price),
      });
      showToast('Item updated successfully', 'success');
    } else {
      const newItem: CoffeeAdminItem = {
        id: `c${Date.now()}`,
        name: draftName,
        category: finalCategory,
        price: Number(coffeeDraft.price),
        caffeine: 'High',
        image: '/media/pic1.jpeg',
        description: '',
      };
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

  return (
    <div className="flex h-screen bg-[#F9F8F4] pt-10 text-[#0a0a0a]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-black/5 px-6 pt-10 pb-6 flex flex-col bg-white/80">
        <div className="mb-6 text-[#0a0a0a]">
          <p className="text-3xl font-serif font-bold text-black">Admin Panel</p>
        </div>

        <nav className="flex-1 space-y-1 text-sm font-sans uppercase tracking-[0.18em]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-left transition-all border-l-2 ${activeTab === tab.id
                ? 'border-black font-semibold underline'
                : 'border-transparent text-zinc-500 hover:text-[#0a0a0a] hover:border-black/10'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
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
              <span>Add Coffee Item</span>
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
            <OverviewCard label="Coffee Items" value={menuItems.length} />
            <OverviewCard label="Artworks" value={artItems.length} />
            <OverviewCard label="Workshops" value={workshops.length} />
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

        {activeTab === 'franchise' && (
          <FranchiseTable
            items={enquiries}
            onMarkRead={markEnquiryRead}
            onDelete={deleteEnquiry}
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
              <h2 className="text-2xl font-serif italic">{editingCoffee ? 'Edit Coffee Item' : 'Add Coffee Item'}</h2>
              <button
                onClick={closeCoffeeModal}
                className="text-xs uppercase tracking-[0.25em] text-zinc-500 hover:text-black"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 font-sans text-sm">
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
                        {category.toUpperCase()}
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
          <th className="px-6 py-3 font-semibold">Coffee</th>
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
            <td className="px-6 py-4 text-sm text-zinc-700">{order.pickupTime}</td>
            <td className="px-6 py-4 text-xs text-zinc-500">
              {new Date(order.date).toLocaleString()}
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
}> = ({ items, onMarkRead, onDelete }) => (
  <div className="bg-white border border-black/5 rounded-xl overflow-hidden">
    <table className="w-full text-left font-sans text-sm">
      <thead className="bg-[#F9F8F4] text-[10px] uppercase tracking-[0.25em] text-zinc-500">
        <tr>
          <th className="px-6 py-3 font-semibold">Name</th>
          <th className="px-6 py-3 font-semibold">Contact</th>
          <th className="px-6 py-3 font-semibold">Location Interest</th>
          <th className="px-6 py-3 font-semibold">Date</th>
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
            <td className="px-6 py-4 text-sm text-zinc-700">{item.contact}</td>
            <td className="px-6 py-4 text-sm text-zinc-700">{item.location}</td>
            <td className="px-6 py-4 text-sm text-zinc-700">{item.date}</td>
            <td className="px-6 py-4">
              <div className="flex gap-3 text-xs uppercase tracking-[0.2em]">
                {!item.read && (
                  <button
                    onClick={() => onMarkRead(item.id)}
                    className="text-emerald-700 hover:text-emerald-900"
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default AdminDashboard;
