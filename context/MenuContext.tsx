import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CoffeeAdminItem, defaultData } from '../DataContext';

export type MenuItem = CoffeeAdminItem;

interface MenuContextValue {
  menuItems: MenuItem[];
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
}

const STORAGE_KEY = 'rabuste_menu';

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

function normalizeCategories(items: MenuItem[]): MenuItem[] {
  return items.map(item => ({
    ...item,
    category: item.category.toUpperCase(),
  }));
}

function loadInitialMenu(): MenuItem[] {
  if (typeof window === 'undefined') return normalizeCategories(defaultData.menuItems);

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalizeCategories(defaultData.menuItems);
    const parsed = JSON.parse(raw) as MenuItem[];
    const base = Array.isArray(parsed) && parsed.length ? parsed : defaultData.menuItems;
    return normalizeCategories(base);
  } catch {
    return normalizeCategories(defaultData.menuItems);
  }
}

export const MenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => loadInitialMenu());

  // Persist whenever menuItems changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(menuItems));
    } catch {
      // ignore write errors (private browsing, quota, etc.)
    }
  }, [menuItems]);

  const addMenuItem = (item: MenuItem) => {
    setMenuItems(prev => [...prev, item]);
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const value: MenuContextValue = {
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export const useMenuContext = (): MenuContextValue => {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenuContext must be used within a MenuProvider');
  return ctx;
};
