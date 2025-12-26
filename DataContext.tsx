import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CartItem } from './types';

// Shared data shapes for menu, art, and workshops
export interface CoffeeAdminItem {
  id: string;
  name: string;
  // Category label, can be predefined or custom
  category: string;
  price: number;
  // kept for legacy but not exposed directly in UI
  caffeine: 'High' | 'Extreme' | 'Very High';
  image: string;
  description: string;
}

export interface ArtAdminItem {
  id: string;
  title: string;
  artist: string;
  price: number;
  status: 'Available' | 'Sold';
  image: string;
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
  ],
  artItems: [
    {
      id: 'a1',
      title: 'Robusta Bloom',
      artist: 'Studio 47',
      price: 12000,
      status: 'Available',
      image: '/media/pic1.jpeg',
    },
    {
      id: 'a2',
      title: 'Night Shift',
      artist: 'Ananya K.',
      price: 18000,
      status: 'Sold',
      image: '/media/pic2.jpeg',
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
  placeOrder: (customer: OrderCustomer, items: CartItem[], total: number, pickupTime: string) => Order;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initial = loadInitialData();
  const [menuItems, setMenuItems] = useState<CoffeeAdminItem[]>(initial.menuItems);
  const [artItems, setArtItems] = useState<ArtAdminItem[]>(initial.artItems);
  const [workshops, setWorkshops] = useState<WorkshopAdminItem[]>(initial.workshops);
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = window.localStorage.getItem(ORDERS_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved) as Order[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Persist menu/art/workshops + orders snapshot to localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const payload: StoredData = { menuItems, artItems, workshops, orders };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore write errors
    }
  }, [menuItems, artItems, workshops, orders]);

  // Persist orders separately under rabuste_orders for fast access in admin / cart flows
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // ignore write errors
    }
  }, [orders]);

  const addMenuItem = (item: CoffeeAdminItem) => {
    setMenuItems(prev => [...prev, item]);
  };

  const updateMenuItem = (id: string, updates: Partial<CoffeeAdminItem>) => {
    setMenuItems(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const addArtItem = (item: ArtAdminItem) => {
    setArtItems(prev => [...prev, item]);
  };

  const updateArtItem = (id: string, updates: Partial<ArtAdminItem>) => {
    setArtItems(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deleteArtItem = (id: string) => {
    setArtItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleArtStatus = (id: string) => {
    setArtItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: item.status === 'Available' ? 'Sold' : 'Available' }
          : item
      )
    );
  };

  const addWorkshop = (item: WorkshopAdminItem) => {
    setWorkshops(prev => [...prev, item]);
  };

  const updateWorkshop = (id: string, updates: Partial<WorkshopAdminItem>) => {
    setWorkshops(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deleteWorkshop = (id: string) => {
    setWorkshops(prev => prev.filter(item => item.id !== id));
  };

  const placeOrder = (
    customer: OrderCustomer,
    items: CartItem[],
    total: number,
    pickupTime: string
  ): Order => {
    const id = `#ORD-${Date.now().toString().slice(-4)}`;
    const order: Order = {
      id,
      customer,
      items,
      total,
      date: new Date().toISOString(),
      pickupTime,
    };
    setOrders(prev => [order, ...prev]);
    return order;
  };

  const value: DataContextValue = {
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
    toggleArtStatus,
    addWorkshop,
    updateWorkshop,
    deleteWorkshop,
    placeOrder,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useDataContext = (): DataContextValue => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useDataContext must be used within a DataProvider');
  return ctx;
};
