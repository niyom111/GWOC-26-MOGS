import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CartItem } from './types';

// Shared data shapes for menu, art, and workshops
export interface CoffeeAdminItem {
  id: string;
  name: string;
  // Category label, can be predefined or custom
  category: string;
  price: number;

  // Legacy label (e.g. "High", "Extreme"); kept for compatibility with chatbot logic
  caffeine: string;

  // New schema-aligned fields (all optional on the client side)
  caffeine_mg?: number | null;
  milk_based?: number | null; // 0/1 integer flag

  calories?: number | null;
  shareable?: number | null; // 0/1 integer flag

  intensity_level?: string | null;
  image: string;
  description: string;
  tags?: string;
}

export interface ArtAdminItem {
  id: string;
  title: string;
  artist: string; // Deprecated, kept for backward compatibility
  artist_name?: string;
  artist_bio?: string;
  description?: string;
  price: number;
  status: 'Available' | 'Sold';
  image: string;
  stock: number;
}

export interface WorkshopAdminItem {
  id: string;
  title: string;
  datetime: string;
  seats: number;
  booked: number;
  price: number;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  email: string;
}

export interface Order {
  id: string;
  customer: OrderCustomer;
  items: CartItem[];
  total: number;
  date: string; // ISO string
  pickupTime: string;
  payment_method?: string;
  payment_status?: string;
}

interface StoredData {
  menuItems: CoffeeAdminItem[];
  artItems: ArtAdminItem[];
  workshops: WorkshopAdminItem[];
  orders: Order[];
}

// Default data used when nothing is in localStorage yet
export const defaultData: StoredData = {
  menuItems: [
    // Robusta Specialty (Cold - Non-Milk)
    { id: 'rs-cnm-1', name: 'Iced Americano', category: 'Robusta Specialty (Cold - Non Milk)', price: 160, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Robusta Specialty (Cold - Non Milk)' },
    { id: 'rs-cnm-2', name: 'Iced Espresso', category: 'Robusta Specialty (Cold - Non Milk)', price: 130, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Robusta Specialty (Cold - Non Milk)' },
    { id: 'rs-cnm-3', name: 'Iced Espresso Tonic', category: 'Robusta Specialty (Cold - Non Milk)', price: 250, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Robusta Specialty (Cold - Non Milk)' },
    { id: 'rs-cnm-4', name: 'Iced Espresso Ginger Ale', category: 'Robusta Specialty (Cold - Non Milk)', price: 250, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Robusta Specialty (Cold - Non Milk)' },
    { id: 'rs-cnm-5', name: 'Iced Espresso Orange', category: 'Robusta Specialty (Cold - Non Milk)', price: 250, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Robusta Specialty (Cold - Non Milk)' },
    { id: 'rs-cnm-6', name: 'Iced Espresso Red Bull', category: 'Robusta Specialty (Cold - Non Milk)', price: 290, caffeine: 'Extreme', image: '/media/pic1.jpeg', description: 'Robusta Specialty (Cold - Non Milk)' },
    { id: 'rs-cnm-7', name: 'Cranberry Tonic', category: 'Robusta Specialty (Cold - Non Milk)', price: 270, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Robusta Specialty (Cold - Non Milk)' },

    // Robusta Specialty (Cold - Milk Based)
    { id: 'rs-cm-1', name: 'Iced Latte', category: 'Robusta Specialty (Cold - Milk Based)', price: 220, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Robusta Specialty (Cold - Milk Based)' },
    { id: 'rs-cm-2', name: 'Affogato', category: 'Robusta Specialty (Cold - Milk Based)', price: 250, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Robusta Specialty (Cold - Milk Based)' },
    { id: 'rs-cm-3', name: 'Classic Frappe', category: 'Robusta Specialty (Cold - Milk Based)', price: 250, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Robusta Specialty (Cold - Milk Based)' },
    { id: 'rs-cm-4', name: 'Hazelnut', category: 'Robusta Specialty (Cold - Milk Based)', price: 260, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Robusta Specialty (Cold - Milk Based)' },
    { id: 'rs-cm-5', name: 'Caramel', category: 'Robusta Specialty (Cold - Milk Based)', price: 260, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Robusta Specialty (Cold - Milk Based)' },
    { id: 'rs-cm-6', name: 'Mocha', category: 'Robusta Specialty (Cold - Milk Based)', price: 270, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Robusta Specialty (Cold - Milk Based)' },
    { id: 'rs-cm-7', name: 'Biscoff', category: 'Robusta Specialty (Cold - Milk Based)', price: 270, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Robusta Specialty (Cold - Milk Based)' },
    { id: 'rs-cm-8', name: 'Vietnamese', category: 'Robusta Specialty (Cold - Milk Based)', price: 240, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Robusta Specialty (Cold - Milk Based)' },
    { id: 'rs-cm-9', name: 'Café Suda', category: 'Robusta Specialty (Cold - Milk Based)', price: 250, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Robusta Specialty (Cold - Milk Based)' },
    { id: 'rs-cm-10', name: 'Robco', category: 'Robusta Specialty (Cold - Milk Based)', price: 290, caffeine: 'Extreme', image: '/media/pic2.jpeg', description: 'Robusta Specialty (Cold - Milk Based)' },

    // Robusta Specialty (Hot - Non Milk)
    { id: 'rs-hnm-1', name: 'Robusta Hot Americano', category: 'Robusta Specialty (Hot - Non Milk)', price: 150, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Robusta Specialty (Hot - Non Milk)' },
    { id: 'rs-hnm-2', name: 'Robusta Hot Espresso', category: 'Robusta Specialty (Hot - Non Milk)', price: 130, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Robusta Specialty (Hot - Non Milk)' },

    // Robusta Specialty (Hot - Milk Based)
    { id: 'rs-hm-1', name: 'Robusta Hot Latte', category: 'Robusta Specialty (Hot - Milk Based)', price: 190, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Robusta Specialty (Hot - Milk Based)' },
    { id: 'rs-hm-2', name: 'Robusta Hot Flat White', category: 'Robusta Specialty (Hot - Milk Based)', price: 180, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Robusta Specialty (Hot - Milk Based)' },
    { id: 'rs-hm-3', name: 'Robusta Hot Cappuccino', category: 'Robusta Specialty (Hot - Milk Based)', price: 180, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Robusta Specialty (Hot - Milk Based)' },
    { id: 'rs-hm-4', name: 'Robusta Mocha', category: 'Robusta Specialty (Hot - Milk Based)', price: 230, caffeine: 'Extreme', image: '/media/pic3.jpeg', description: 'Robusta Specialty (Hot - Milk Based)' },

    // Blend (Cold - Non Milk)
    { id: 'bl-cnm-1', name: 'Iced Americano', category: 'Blend (Cold - Non Milk)', price: 150, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Blend (Cold - Non Milk)' },
    { id: 'bl-cnm-2', name: 'Iced Espresso', category: 'Blend (Cold - Non Milk)', price: 120, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Blend (Cold - Non Milk)' },
    { id: 'bl-cnm-3', name: 'Iced Espresso Tonic', category: 'Blend (Cold - Non Milk)', price: 230, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Blend (Cold - Non Milk)' },
    { id: 'bl-cnm-4', name: 'Iced Espresso Ginger Ale', category: 'Blend (Cold - Non Milk)', price: 230, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Blend (Cold - Non Milk)' },
    { id: 'bl-cnm-5', name: 'Iced Espresso Orange', category: 'Blend (Cold - Non Milk)', price: 230, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Blend (Cold - Non Milk)' },
    { id: 'bl-cnm-6', name: 'Iced Espresso Red Bull', category: 'Blend (Cold - Non Milk)', price: 270, caffeine: 'Extreme', image: '/media/pic1.jpeg', description: 'Blend (Cold - Non Milk)' },
    { id: 'bl-cnm-7', name: 'Cranberry Tonic', category: 'Blend (Cold - Non Milk)', price: 250, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Blend (Cold - Non Milk)' },

    // Blend (Cold - Milk Based)
    { id: 'bl-cm-1', name: 'Iced Latte', category: 'Blend (Cold - Milk Based)', price: 210, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Blend (Cold - Milk Based)' },
    { id: 'bl-cm-2', name: 'Affogato', category: 'Blend (Cold - Milk Based)', price: 240, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Blend (Cold - Milk Based)' },
    { id: 'bl-cm-3', name: 'Classic Frappe', category: 'Blend (Cold - Milk Based)', price: 240, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Blend (Cold - Milk Based)' },
    { id: 'bl-cm-4', name: 'Hazelnut', category: 'Blend (Cold - Milk Based)', price: 250, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Blend (Cold - Milk Based)' },
    { id: 'bl-cm-5', name: 'Caramel', category: 'Blend (Cold - Milk Based)', price: 250, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Blend (Cold - Milk Based)' },
    { id: 'bl-cm-6', name: 'Mocha', category: 'Blend (Cold - Milk Based)', price: 260, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Blend (Cold - Milk Based)' },
    { id: 'bl-cm-7', name: 'Biscoff', category: 'Blend (Cold - Milk Based)', price: 260, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Blend (Cold - Milk Based)' },

    // Blend (Hot - Non Milk)
    { id: 'bl-hnm-1', name: 'Hot Americano', category: 'Blend (Hot - Non Milk)', price: 140, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Blend (Hot - Non Milk)' },
    { id: 'bl-hnm-2', name: 'Hot Espresso', category: 'Blend (Hot - Non Milk)', price: 120, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Blend (Hot - Non Milk)' },

    // Blend (Hot - Milk Based)
    { id: 'bl-hm-1', name: 'Hot Latte', category: 'Blend (Hot - Milk Based)', price: 180, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Blend (Hot - Milk Based)' },
    { id: 'bl-hm-2', name: 'Hot Flat White', category: 'Blend (Hot - Milk Based)', price: 170, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Blend (Hot - Milk Based)' },
    { id: 'bl-hm-3', name: 'Hot Cappuccino', category: 'Blend (Hot - Milk Based)', price: 170, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Blend (Hot - Milk Based)' },
    { id: 'bl-hm-4', name: 'Mocha', category: 'Blend (Hot - Milk Based)', price: 220, caffeine: 'Extreme', image: '/media/pic3.jpeg', description: 'Blend (Hot - Milk Based)' },

    // Manual Brew
    { id: 'mb-1', name: 'Classic Cold Brew', category: 'Manual Brew (Peaberry Special)', price: 220, caffeine: 'Very High', image: '/media/pic1.jpeg', description: 'Manual Brew (Peaberry Special)' },
    { id: 'mb-2', name: 'Cold Brew Tonic', category: 'Manual Brew (Peaberry Special)', price: 270, caffeine: 'Very High', image: '/media/pic1.jpeg', description: 'Manual Brew (Peaberry Special)' },
    { id: 'mb-3', name: 'Cold Brew Ginger Ale', category: 'Manual Brew (Peaberry Special)', price: 270, caffeine: 'Very High', image: '/media/pic1.jpeg', description: 'Manual Brew (Peaberry Special)' },
    { id: 'mb-4', name: 'Cold Brew Orange', category: 'Manual Brew (Peaberry Special)', price: 270, caffeine: 'Very High', image: '/media/pic1.jpeg', description: 'Manual Brew (Peaberry Special)' },
    { id: 'mb-5', name: 'Cold Brew Red Bull', category: 'Manual Brew (Peaberry Special)', price: 290, caffeine: 'Extreme', image: '/media/pic1.jpeg', description: 'Manual Brew (Peaberry Special)' },
    { id: 'mb-6', name: 'V60 Pour Over Hot', category: 'Manual Brew (Peaberry Special)', price: 220, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Manual Brew (Peaberry Special)' },
    { id: 'mb-7', name: 'V60 Pour Over Cold', category: 'Manual Brew (Peaberry Special)', price: 230, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Manual Brew (Peaberry Special)' },
    { id: 'mb-8', name: 'Cranberry Cold Brew Tonic', category: 'Manual Brew (Peaberry Special)', price: 280, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Manual Brew (Peaberry Special)' },

    // Shakes
    { id: 'sh-1', name: 'Chocolate', category: 'Shakes', price: 220, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Shakes' },
    { id: 'sh-2', name: 'Biscoff', category: 'Shakes', price: 250, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Shakes' },
    { id: 'sh-3', name: 'Nutella', category: 'Shakes', price: 260, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Shakes' },

    // Tea
    { id: 'tea-1', name: 'Lemon Ice Tea', category: 'Tea (Cold)', price: 210, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Tea (Cold)' },
    { id: 'tea-2', name: 'Peach Ice Tea', category: 'Tea (Cold)', price: 210, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Tea (Cold)' },
    { id: 'tea-3', name: 'Ginger Fizz', category: 'Tea (Cold)', price: 250, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Tea (Cold)' },
    { id: 'tea-4', name: 'Classic Orange Mint', category: 'Tea (Cold)', price: 250, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Tea (Cold)' },

    // Food
    { id: 'fd-1', name: 'Fries', category: 'Food', price: 150, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Food' },
    { id: 'fd-2', name: 'Potato Wedges', category: 'Food', price: 170, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Food' },
    { id: 'fd-3', name: 'Veg Nuggets', category: 'Food', price: 190, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Food' },
    { id: 'fd-4', name: 'Pizza', category: 'Food', price: 300, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Food' },
    { id: 'fd-5', name: 'Bagel', category: 'Food', price: 100, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Food' },
    { id: 'fd-6', name: 'Cream Cheese Bagel', category: 'Food', price: 150, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Food' },
    { id: 'fd-7', name: 'Jalapeno Cheese Bagel', category: 'Food', price: 200, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Food' },
    { id: 'fd-8', name: 'Pesto Bagel', category: 'Food', price: 230, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Food' },
    { id: 'fd-9', name: 'Butter Croissant', category: 'Food', price: 150, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Food' },
    { id: 'fd-10', name: 'Nutella Croissant', category: 'Food', price: 200, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Food' },
    { id: 'fd-11', name: 'Cream Cheese Croissant', category: 'Food', price: 240, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Food' }

  ],
  artItems: [
    {
      id: 'a1',
      title: 'Robusta Bloom',
      artist: 'Studio 47',
      price: 12000,
      status: 'Available',
      image: '/media/pic1.jpeg',
      stock: 1,
    },
    {
      id: 'a2',
      title: 'Night Shift',
      artist: 'Ananya K.',
      price: 18000,
      status: 'Sold',
      image: '/media/pic2.jpeg',
      stock: 0,
    },
  ],
  workshops: [
    {
      id: 'w1',
      title: 'Latte Art Basics',
      datetime: 'Oct 24, 10:00 AM',
      seats: 8,
      booked: 5,
      price: 0,
    },
    {
      id: 'w2',
      title: 'The Robusta Brew Lab',
      datetime: 'Nov 02, 8:00 AM',
      seats: 10,
      booked: 7,
      price: 799,
    },
  ],
  orders: [],
};

const STORAGE_KEY = 'rabuste-admin-data-v1';
const ORDERS_KEY = 'rabuste_orders';

function loadInitialData(): StoredData {
  if (typeof window === 'undefined') {
    return defaultData;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as Partial<StoredData>;
    return {
      menuItems: parsed.menuItems && parsed.menuItems.length ? parsed.menuItems : defaultData.menuItems,
      artItems: parsed.artItems && parsed.artItems.length ? parsed.artItems : defaultData.artItems,
      workshops: parsed.workshops && parsed.workshops.length ? parsed.workshops : defaultData.workshops,
      orders: parsed.orders && parsed.orders.length ? parsed.orders : [],
    };
  } catch {
    return defaultData;
  }
}

interface DataContextValue {
  menuItems: CoffeeAdminItem[];
  artItems: ArtAdminItem[];
  workshops: WorkshopAdminItem[];
  orders: Order[];
  addMenuItem: (item: CoffeeAdminItem) => void;
  updateMenuItem: (id: string, updates: Partial<CoffeeAdminItem>) => void;
  deleteMenuItem: (id: string) => void;
  addArtItem: (item: ArtAdminItem) => void;
  updateArtItem: (id: string, updates: Partial<ArtAdminItem>) => void;
  deleteArtItem: (id: string) => void;
  toggleArtStatus: (id: string) => void;
  addWorkshop: (item: WorkshopAdminItem) => void;
  updateWorkshop: (id: string, updates: Partial<WorkshopAdminItem>) => void;
  deleteWorkshop: (id: string) => void;
  placeOrder: (customer: OrderCustomer, items: CartItem[], total: number, pickupTime: string, paymentMethod?: string) => Promise<Order>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<CoffeeAdminItem[]>([]);
  const [artItems, setArtItems] = useState<ArtAdminItem[]>([]);
  const [workshops, setWorkshops] = useState<WorkshopAdminItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // FETCH DATA ON MOUNT
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, artRes, workshopRes, orderRes] = await Promise.all([
          fetch('http://localhost:5000/api/menu'),
          fetch('http://localhost:5000/api/art'),
          fetch('http://localhost:5000/api/workshops'),
          fetch('http://localhost:5000/api/orders')
        ]);

        if (menuRes.ok) setMenuItems(await menuRes.json());
        if (artRes.ok) setArtItems(await artRes.json());
        if (workshopRes.ok) setWorkshops(await workshopRes.json());
        if (orderRes.ok) setOrders(await orderRes.json());
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  // --- MENU ACTIONS ---
  const addMenuItem = async (item: CoffeeAdminItem) => {
    try {
      const res = await fetch('http://localhost:5000/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const newItem = await res.json();
        setMenuItems(prev => [...prev, newItem]);
      } else {
        throw new Error('Failed to add menu item');
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<CoffeeAdminItem>) => {
    try {
      const res = await fetch(`http://localhost:5000/api/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update menu item');
      setMenuItems(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/menu/${id}`, { method: 'DELETE' });
      setMenuItems(prev => prev.filter(item => item.id !== id));
    } catch (err) { console.error(err); }
  };

  // --- ART ACTIONS ---
  const addArtItem = async (item: ArtAdminItem) => {
    try {
      const res = await fetch('http://localhost:5000/api/art', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const newItem = await res.json();
        setArtItems(prev => [...prev, newItem]);
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to add art item');
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateArtItem = async (id: string, updates: Partial<ArtAdminItem>) => {
    try {
      const res = await fetch(`http://localhost:5000/api/art/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update art item');

      setArtItems(prev => prev.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        // Auto-update status based on stock if stock is part of updates
        if (updates.stock !== undefined) {
          if (updates.stock > 0) updated.status = 'Available';
          else updated.status = 'Sold';
        }
        return updated;
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteArtItem = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/art/${id}`, { method: 'DELETE' });
      setArtItems(prev => prev.filter(item => item.id !== id));
    } catch (err) { console.error(err); }
  };

  const toggleArtStatus = async (id: string) => {
    const item = artItems.find(a => a.id === id);
    if (!item) return;
    const newStatus = item.status === 'Available' ? 'Sold' : 'Available';
    updateArtItem(id, { status: newStatus });
  };

  // --- WORKSHOP ACTIONS ---
  const addWorkshop = async (item: WorkshopAdminItem) => {
    // TODO: Implement API if needed, currently read-only in UI mostly
    setWorkshops(prev => [...prev, item]);
  };
  const updateWorkshop = async (id: string, updates: Partial<WorkshopAdminItem>) => {
    setWorkshops(prev => prev.map(w => (w.id === id ? { ...w, ...updates } : w)));
  };
  const deleteWorkshop = async (id: string) => {
    setWorkshops(prev => prev.filter(w => w.id !== id));
  };


  // --- ORDER ACTIONS ---
  const placeOrder = async (customer: OrderCustomer, items: CartItem[], total: number, pickupTime: string, paymentMethod: string = 'counter'): Promise<Order> => {
    const newOrder: Order = {
      id: Date.now().toString(),
      customer,
      items,
      total,
      date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }), // Use local IST approximation for optimistic UI
      pickupTime,
      payment_method: paymentMethod || 'Paid at Counter',
      payment_status: paymentMethod === 'upi' || paymentMethod === 'Paid Online' ? 'PAID' : 'PENDING_PAYMENT'
    };

    console.log('[FRONTEND] placeOrder called with:', {
      customer,
      itemsCount: items.length,
      total,
      pickupTime,
      orderId: newOrder.id,
      paymentMethod
    });
    console.log('[FRONTEND] Full order object:', JSON.stringify(newOrder, null, 2));

    // Optimistic update
    setOrders(prev => [newOrder, ...prev]);

    // Save to backend - throw error if it fails
    try {
      console.log('[FRONTEND] Sending POST to http://localhost:5000/api/orders');
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newOrder, paymentMethod })
      });

      console.log('[FRONTEND] Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        console.error('[FRONTEND] Response not OK, status:', response.status);
        let errorMessage = 'Failed to save order to server';
        try {
          const errorData = await response.json();
          console.error('[FRONTEND] Error data from server:', errorData);
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (parseError) {
          console.error('[FRONTEND] Failed to parse error response:', parseError);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const savedOrder = await response.json();
      console.log('[FRONTEND] Order saved successfully:', savedOrder.id);
      return savedOrder;
    } catch (error: any) {
      console.error('[FRONTEND] Error in placeOrder:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      // Re-throw with more context if it's not already an Error
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error.message || 'Network error: Failed to connect to server');
    }
  };

  // Reverted deleteOrder
  return (
    <DataContext.Provider
      value={{
        menuItems,
        artItems,
        workshops,
        orders,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        addArtItem,
        updateArtItem,
        deleteArtItem,
        removeArtItem: deleteArtItem, // Alias for component compatibility
        toggleArtStatus,
        addWorkshop,
        updateWorkshop,
        deleteWorkshop,
        placeOrder,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};


export const useDataContext = (): DataContextValue => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useDataContext must be used within a DataProvider');
  return ctx;
};
