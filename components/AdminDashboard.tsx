
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
} from 'lucide-react';
import {
  useDataContext,
  CoffeeAdminItem,
  ArtAdminItem,
  WorkshopAdminItem,
} from '../DataContext';
import { useMenuContext } from '../context/MenuContext';

interface AdminDashboardProps {
  onBack: () => void;
}

interface FranchiseEnquiry {
  id: string;
  name: string;
  contact: string;
  location: string;
  date: string;
  read: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'coffee' | 'art' | 'workshops' | 'franchise'>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'coffee' as const, label: 'Coffee Menu', icon: Coffee },
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
    addWorkshop,
    addArtItem,
  } = useDataContext();

  const {
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
  } = useMenuContext();

  // Dynamically derive available categories from current menu items
  const categoryOptions = useMemo(
    () => Array.from(new Set(menuItems.map(item => item.category))).sort(),
    [menuItems]
  );

  // Dummy initial data – structured for easy API replacement later
  const [coffeeItems, setCoffeeItems] = useState<CoffeeAdminItem[]>([
    // Robusta Specialty (Cold - Non Milk)
    {
      id: 'rs-cnm-1',
      name: 'Iced Americano',
      category: 'Robusta Specialty (Cold - Non Milk)',
      price: 160,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      description: 'Robusta Specialty (Cold - Non Milk)',
    },
    {
      id: 'rs-cnm-2',
      name: 'Iced Espresso',
      category: 'Robusta Specialty (Cold - Non Milk)',
      price: 130,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      description: 'Robusta Specialty (Cold - Non Milk)',
    },
    {
      id: 'rs-cnm-3',
      name: 'Iced Espresso Tonic',
      category: 'Robusta Specialty (Cold - Non Milk)',
      price: 250,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      description: 'Robusta Specialty (Cold - Non Milk)',
    },
    {
      id: 'rs-cnm-4',
      name: 'Iced Espresso Red Bull',
      category: 'Robusta Specialty (Cold - Non Milk)',
      price: 290,
      caffeine: 'Extreme',
      image: '/media/pic1.jpeg',
      description: 'Robusta Specialty (Cold - Non Milk)',
    },
    {
      id: 'rs-cnm-5',
      name: 'Cranberry Tonic',
      category: 'Robusta Specialty (Cold - Non Milk)',
      price: 270,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      description: 'Robusta Specialty (Cold - Non Milk)',
    },

    // Robusta Specialty (Cold - Milk Based)
    {
      id: 'rs-cm-1',
      name: 'Iced Latte',
      category: 'Robusta Specialty (Cold - Milk Based)',
      price: 220,
      caffeine: 'High',
      image: '/media/pic2.jpeg',
      description: 'Robusta Specialty (Cold - Milk Based)',
    },
    {
      id: 'rs-cm-2',
      name: 'Affogato',
      category: 'Robusta Specialty (Cold - Milk Based)',
      price: 250,
      caffeine: 'High',
      image: '/media/pic2.jpeg',
      description: 'Robusta Specialty (Cold - Milk Based)',
    },
    {
      id: 'rs-cm-3',
      name: 'Classic Frappe',
      category: 'Robusta Specialty (Cold - Milk Based)',
      price: 250,
      caffeine: 'High',
      image: '/media/pic2.jpeg',
      description: 'Robusta Specialty (Cold - Milk Based)',
    },
    {
      id: 'rs-cm-4',
      name: 'Hazelnut',
      category: 'Robusta Specialty (Cold - Milk Based)',
      price: 260,
      caffeine: 'High',
      image: '/media/pic2.jpeg',
      description: 'Robusta Specialty (Cold - Milk Based)',
    },
    {
      id: 'rs-cm-5',
      name: 'Caramel',
      category: 'Robusta Specialty (Cold - Milk Based)',
      price: 260,
      caffeine: 'High',
      image: '/media/pic2.jpeg',
      description: 'Robusta Specialty (Cold - Milk Based)',
    },
    {
      id: 'rs-cm-6',
      name: 'Mocha',
      category: 'Robusta Specialty (Cold - Milk Based)',
      price: 270,
      caffeine: 'High',
      image: '/media/pic2.jpeg',
      description: 'Robusta Specialty (Cold - Milk Based)',
    },
    {
      id: 'rs-cm-7',
      name: 'Biscoff',
      category: 'Robusta Specialty (Cold - Milk Based)',
      price: 270,
      caffeine: 'High',
      image: '/media/pic2.jpeg',
      description: 'Robusta Specialty (Cold - Milk Based)',
    },
    {
      id: 'rs-cm-8',
      name: 'Vietnamese',
      category: 'Robusta Specialty (Cold - Milk Based)',
      price: 240,
      caffeine: 'High',
      image: '/media/pic2.jpeg',
      description: 'Robusta Specialty (Cold - Milk Based)',
    },
    {
      id: 'rs-cm-9',
      name: 'Cafe Suda',
      category: 'Robusta Specialty (Cold - Milk Based)',
      price: 250,
      caffeine: 'High',
      image: '/media/pic2.jpeg',
      description: 'Robusta Specialty (Cold - Milk Based)',
    },
    {
      id: 'rs-cm-10',
      name: 'Robco',
      category: 'Robusta Specialty (Cold - Milk Based)',
      price: 290,
      caffeine: 'Extreme',
      image: '/media/pic2.jpeg',
      description: 'Robusta Specialty (Cold - Milk Based)',
    },

    // Robusta Specialty (Hot - Non Milk)
    {
      id: 'rs-hnm-1',
      name: 'Hot Americano',
      category: 'Robusta Specialty (Hot - Non Milk)',
      price: 150,
      caffeine: 'High',
      image: '/media/pic3.jpeg',
      description: 'Robusta Specialty (Hot - Non Milk)',
    },
    {
      id: 'rs-hnm-2',
      name: 'Hot Espresso',
      category: 'Robusta Specialty (Hot - Non Milk)',
      price: 130,
      caffeine: 'High',
      image: '/media/pic3.jpeg',
      description: 'Robusta Specialty (Hot - Non Milk)',
    },

    // Robusta Specialty (Hot - Milk Based)
    {
      id: 'rs-hm-1',
      name: 'Hot Latte',
      category: 'Robusta Specialty (Hot - Milk Based)',
      price: 190,
      caffeine: 'High',
      image: '/media/pic3.jpeg',
      description: 'Robusta Specialty (Hot - Milk Based)',
    },
    {
      id: 'rs-hm-2',
      name: 'Hot Flat White',
      category: 'Robusta Specialty (Hot - Milk Based)',
      price: 180,
      caffeine: 'High',
      image: '/media/pic3.jpeg',
      description: 'Robusta Specialty (Hot - Milk Based)',
    },
    {
      id: 'rs-hm-3',
      name: 'Hot Cappuccino',
      category: 'Robusta Specialty (Hot - Milk Based)',
      price: 180,
      caffeine: 'High',
      image: '/media/pic3.jpeg',
      description: 'Robusta Specialty (Hot - Milk Based)',
    },
    {
      id: 'rs-hm-4',
      name: 'Robusta Mocha',
      category: 'Robusta Specialty (Hot - Milk Based)',
      price: 230,
      caffeine: 'Extreme',
      image: '/media/pic3.jpeg',
      description: 'Robusta Specialty (Hot - Milk Based)',
    },

    // Blend (Cold - Non Milk)
    {
      id: 'bl-cnm-1',
      name: 'Iced Americano',
      category: 'Blend (Cold - Non Milk)',
      price: 150,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      description: 'Blend (Cold - Non Milk)',
    },
    {
      id: 'bl-cnm-2',
      name: 'Iced Espresso',
      category: 'Blend (Cold - Non Milk)',
      price: 120,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      description: 'Blend (Cold - Non Milk)',
    },
    {
      id: 'bl-cnm-3',
      name: 'Iced Espresso Tonic',
      category: 'Blend (Cold - Non Milk)',
      price: 230,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      description: 'Blend (Cold - Non Milk)',
    },
    {
      id: 'bl-cnm-4',
      name: 'Iced Espresso Red Bull',
      category: 'Blend (Cold - Non Milk)',
      price: 270,
      caffeine: 'Extreme',
      image: '/media/pic1.jpeg',
      description: 'Blend (Cold - Non Milk)',
    },
    {
      id: 'bl-cnm-5',
      name: 'Cranberry Tonic',
      category: 'Blend (Cold - Non Milk)',
      price: 250,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      description: 'Blend (Cold - Non Milk)',
    },

    // Blend (Cold - Milk Based)
    {
      id: 'bl-cm-1',
      name: 'Iced Latte',
      category: 'Blend (Cold - Milk Based)',
      price: 210,
      caffeine: 'High',
      image: '/media/pic2.jpeg',
      description: 'Blend (Cold - Milk Based)',
    },
    {
      id: 'bl-cm-2',
      name: 'Affogato',
      category: 'Blend (Cold - Milk Based)',
      price: 240,
      caffeine: 'High',
      image: '/media/pic2.jpeg',
      description: 'Blend (Cold - Milk Based)',
    },
    {
      id: 'bl-cm-3',
      name: 'Classic Frappe',
      category: 'Blend (Cold - Milk Based)',
      price: 240,
      caffeine: 'High',
      image: '/media/pic2.jpeg',
      description: 'Blend (Cold - Milk Based)',
    },
    {
      id: 'bl-cm-4',
      name: 'Hazelnut',
      category: 'Blend (Cold - Milk Based)',
      price: 250,
      caffeine: 'High',
      image: '/media/pic2.jpeg',
      description: 'Blend (Cold - Milk Based)',
    },
    {
      id: 'bl-cm-5',
      name: 'Caramel',
      category: 'Blend (Cold - Milk Based)',
      price: 250,
      caffeine: 'High',
      image: '/media/pic2.jpeg',
      description: 'Blend (Cold - Milk Based)',
    },
    {
      id: 'bl-cm-6',
      name: 'Mocha',
      category: 'Blend (Cold - Milk Based)',
      price: 260,
      caffeine: 'High',
      image: '/media/pic2.jpeg',
      description: 'Blend (Cold - Milk Based)',
    },
    {
      id: 'bl-cm-7',
      name: 'Biscoff',
      category: 'Blend (Cold - Milk Based)',
      price: 260,
      caffeine: 'High',
      image: '/media/pic2.jpeg',
      description: 'Blend (Cold - Milk Based)',
    },

    // Blend (Hot - Non Milk)
    {
      id: 'bl-hnm-1',
      name: 'Hot Americano',
      category: 'Blend (Hot - Non Milk)',
      price: 140,
      caffeine: 'High',
      image: '/media/pic3.jpeg',
      description: 'Blend (Hot - Non Milk)',
    },
    {
      id: 'bl-hnm-2',
      name: 'Hot Espresso',
      category: 'Blend (Hot - Non Milk)',
      price: 120,
      caffeine: 'High',
      image: '/media/pic3.jpeg',
      description: 'Blend (Hot - Non Milk)',
    },

    // Blend (Hot - Milk Based)
    {
      id: 'bl-hm-1',
      name: 'Hot Latte',
      category: 'Blend (Hot - Milk Based)',
      price: 180,
      caffeine: 'High',
      image: '/media/pic3.jpeg',
      description: 'Blend (Hot - Milk Based)',
    },
    {
      id: 'bl-hm-2',
      name: 'Hot Flat White',
      category: 'Blend (Hot - Milk Based)',
      price: 170,
      caffeine: 'High',
      image: '/media/pic3.jpeg',
      description: 'Blend (Hot - Milk Based)',
    },
    {
      id: 'bl-hm-3',
      name: 'Hot Cappuccino',
      category: 'Blend (Hot - Milk Based)',
      price: 170,
      caffeine: 'High',
      image: '/media/pic3.jpeg',
      description: 'Blend (Hot - Milk Based)',
    },
    {
      id: 'bl-hm-4',
      name: 'Blend Mocha',
      category: 'Blend (Hot - Milk Based)',
      price: 220,
      caffeine: 'Extreme',
      image: '/media/pic3.jpeg',
      description: 'Blend (Hot - Milk Based)',
    },

    // Manual Brew (Peaberry Special)
    {
      id: 'mb-1',
      name: 'Classic Cold Brew',
      category: 'Manual Brew (Peaberry Special)',
      price: 220,
      caffeine: 'Very High',
      image: '/media/pic1.jpeg',
      description: 'Manual Brew (Peaberry Special)',
    },
    {
      id: 'mb-2',
      name: 'Cold Brew Tonic',
      category: 'Manual Brew (Peaberry Special)',
      price: 270,
      caffeine: 'Very High',
      image: '/media/pic1.jpeg',
      description: 'Manual Brew (Peaberry Special)',
    },
    {
      id: 'mb-3',
      name: 'Cold Brew Red Bull',
      category: 'Manual Brew (Peaberry Special)',
      price: 290,
      caffeine: 'Extreme',
      image: '/media/pic1.jpeg',
      description: 'Manual Brew (Peaberry Special)',
    },
    {
      id: 'mb-4',
      name: 'V60 Pour Over Hot',
      category: 'Manual Brew (Peaberry Special)',
      price: 220,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      description: 'Manual Brew (Peaberry Special)',
    },
    {
      id: 'mb-5',
      name: 'V60 Pour Over Cold',
      category: 'Manual Brew (Peaberry Special)',
      price: 230,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      description: 'Manual Brew (Peaberry Special)',
    },
    {
      id: 'mb-6',
      name: 'Cranberry Cold Brew Tonic',
      category: 'Manual Brew (Peaberry Special)',
      price: 280,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      description: 'Manual Brew (Peaberry Special)',
    },

    // Shakes
    {
      id: 'sh-1',
      name: 'Chocolate',
      category: 'Shakes',
      price: 220,
      caffeine: 'High',
      image: '/media/pic2.jpeg',
      description: 'Shakes',
    },
    {
      id: 'sh-2',
      name: 'Biscoff',
      category: 'Shakes',
      price: 250,
      caffeine: 'High',
      image: '/media/pic2.jpeg',
      description: 'Shakes',
    },
    {
      id: 'sh-3',
      name: 'Nutella',
      category: 'Shakes',
      price: 260,
      caffeine: 'High',
      image: '/media/pic2.jpeg',
      description: 'Shakes',
    },

    // Tea (Cold)
    {
      id: 'tea-1',
      name: 'Lemon Ice Tea',
      category: 'Tea (Cold)',
      price: 210,
      caffeine: 'High',
      image: '/media/pic3.jpeg',
      description: 'Tea (Cold)',
    },
    {
      id: 'tea-2',
      name: 'Peach Ice Tea',
      category: 'Tea (Cold)',
      price: 210,
      caffeine: 'High',
      image: '/media/pic3.jpeg',
      description: 'Tea (Cold)',
    },
    {
      id: 'tea-3',
      name: 'Ginger Fizz',
      category: 'Tea (Cold)',
      price: 250,
      caffeine: 'High',
      image: '/media/pic3.jpeg',
      description: 'Tea (Cold)',
    },
    {
      id: 'tea-4',
      name: 'Orange Mint',
      category: 'Tea (Cold)',
      price: 250,
      caffeine: 'High',
      image: '/media/pic3.jpeg',
      description: 'Tea (Cold)',
    },

    // Food & Bagels
    {
      id: 'fb-1',
      name: 'Fries',
      category: 'Food & Bagels',
      price: 150,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      description: 'Food & Bagels',
    },
    {
      id: 'fb-2',
      name: 'Wedges',
      category: 'Food & Bagels',
      price: 170,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      description: 'Food & Bagels',
    },
    {
      id: 'fb-3',
      name: 'Veg Nuggets',
      category: 'Food & Bagels',
      price: 190,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      description: 'Food & Bagels',
    },
    {
      id: 'fb-4',
      name: 'Pizza',
      category: 'Food & Bagels',
      price: 300,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      description: 'Food & Bagels',
    },
    {
      id: 'fb-5',
      name: 'Bagel',
      category: 'Food & Bagels',
      price: 100,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      description: 'Food & Bagels',
    },
    {
      id: 'fb-6',
      name: 'Cream Cheese Bagel',
      category: 'Food & Bagels',
      price: 150,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      description: 'Food & Bagels',
    },
    {
      id: 'fb-7',
      name: 'Jalapeno Bagel',
      category: 'Food & Bagels',
      price: 200,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      description: 'Food & Bagels',
    },
    {
      id: 'fb-8',
      name: 'Pesto Bagel',
      category: 'Food & Bagels',
      price: 230,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      description: 'Food & Bagels',
    },
    {
      id: 'fb-9',
      name: 'Butter Croissant',
      category: 'Food & Bagels',
      price: 150,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      description: 'Food & Bagels',
    },
    {
      id: 'fb-10',
      name: 'Nutella Croissant',
      category: 'Food & Bagels',
      price: 200,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      description: 'Food & Bagels',
    },
    {
      id: 'fb-11',
      name: 'Cream Cheese Croissant',
      category: 'Food & Bagels',
      price: 240,
      caffeine: 'High',
      image: '/media/pic1.jpeg',
      description: 'Food & Bagels',
    },
  ]);

  // artItems and workshops now come from DataContext (see useDataContext above)

  const [enquiries, setEnquiries] = useState<FranchiseEnquiry[]>([
    {
      id: 'f1',
      name: 'Aarav Mehta',
      contact: '+91 98765 00001',
      location: 'Ahmedabad',
      date: 'Oct 20, 2024',
      read: false,
    },
    {
      id: 'f2',
      name: 'Priya Shah',
      contact: 'priya@example.com',
      location: 'Pune',
      date: 'Oct 22, 2024',
      read: true,
    },
  ]);

  // Modal state for Coffee items
  const [coffeeModalOpen, setCoffeeModalOpen] = useState(false);
  const [editingCoffee, setEditingCoffee] = useState<CoffeeAdminItem | null>(null);
  const [coffeeDraft, setCoffeeDraft] = useState<Partial<CoffeeAdminItem>>({});
  const [newCategoryName, setNewCategoryName] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CoffeeAdminItem | null>(null);

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

  const confirmDeleteCoffeeItem = () => {
    if (!itemToDelete) return;
    deleteMenuItem(itemToDelete.id);
    setDeleteModalOpen(false);
    setItemToDelete(null);
    showToast('Item deleted successfully', 'success');
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
              className={`w-full flex items-center space-x-3 px-3 py-2 text-left transition-all border-l-2 ${
                activeTab === tab.id
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
          onClick={onBack}
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
              onClick={() => {
                const newArt: ArtAdminItem = {
                  id: `a${Date.now()}`,
                  title: 'Untitled Piece',
                  artist: 'Unknown',
                  price: 10000,
                  status: 'Available',
                  image: '/media/pic3.jpeg',
                };
                addArtItem(newArt);
              }}
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

        {activeTab === 'art' && (
          <ArtTable items={artItems} onToggleStatus={toggleArtStatus} />
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
              <p className="text-sm font-serif mb-6">"{itemToDelete.name}"</p>
            )}
            <div className="flex justify-end gap-3 text-[11px] uppercase tracking-[0.25em]">
              <button
                onClick={cancelDeleteCoffeeItem}
                className="px-4 py-2 text-zinc-500 hover:text-black"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCoffeeItem}
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
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-white border rounded-full shadow-lg ${
            toast.type === 'success' ? 'border-black/40' : 'border-red-400'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-black" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm font-serif">{toast.message}</span>
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

// Art table
const ArtTable: React.FC<{
  items: ArtAdminItem[];
  onToggleStatus: (id: string) => void;
}> = ({ items, onToggleStatus }) => (
  <div className="bg-white border border-black/5 rounded-xl overflow-hidden">
    <table className="w-full text-left font-sans text-sm">
      <thead className="bg-[#F9F8F4] text-[10px] uppercase tracking-[0.25em] text-zinc-500">
        <tr>
          <th className="px-6 py-3 font-semibold">Artwork</th>
          <th className="px-6 py-3 font-semibold">Artist</th>
          <th className="px-6 py-3 font-semibold">Price (₹)</th>
          <th className="px-6 py-3 font-semibold">Status</th>
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
            <td className="px-6 py-4 text-sm text-zinc-700">{item.artist}</td>
            <td className="px-6 py-4 text-sm font-semibold">₹{item.price}</td>
            <td className="px-6 py-4">
              <button
                onClick={() => onToggleStatus(item.id)}
                className={`px-3 py-1 text-[10px] uppercase tracking-[0.2em] rounded-full border ${
                  item.status === 'Available'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-zinc-300 bg-zinc-100 text-zinc-600'
                }`}
              >
                {item.status}
              </button>
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
