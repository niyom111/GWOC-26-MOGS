
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion as motionBase, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import CustomDropdown from './ui/CustomDropdown';
import { CoffeeItem } from '../types';
import { useDataContext } from '../DataContext';
import BrewDeskPopup from './BrewDeskPopup';
import StatusPopup from './StatusPopup';
import Toast from './Toast';
import { API_BASE_URL } from '../config';
import { getMenuImage } from './MenuItemImages';
import MenuProductCard from './MenuProductCard';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

interface MenuSubCategory {
  id: string;
  title: string;
  items: MenuItem[];
}

interface MenuCategory {
  id: string;
  label: string;
  subCategories: MenuSubCategory[];
  items: MenuItem[]; // Keep for flat fallback/search flattening
  group?: string; // For legacy or grouping
}

// NOTE: static MENU_CATEGORIES kept only as reference; live data now comes from MenuContext.
const MENU_CATEGORIES: Partial<MenuCategory>[] = [
  {
    id: 'robusta-cold-non-milk',
    label: 'Robusta Specialty (Cold - Non Milk)',
    subCategories: [
      {
        id: 'robusta-cold-non-milk-sub',
        title: 'Robusta Specialty (Cold - Non Milk)',
        items: [
          { id: 'robusta-cold-non-milk-iced-americano', name: 'Iced Americano', price: 160 },
          { id: 'robusta-cold-non-milk-iced-espresso', name: 'Iced Espresso', price: 130 },
          {
            id: 'robusta-cold-non-milk-iced-espresso-tonic',
            name: 'Iced Espresso (Tonic / Ginger Ale / Orange)',
            price: 250,
          },
          {
            id: 'robusta-cold-non-milk-iced-espresso-red-bull',
            name: 'Iced Espresso (Red Bull)',
            price: 290,
          },
          { id: 'robusta-cold-non-milk-cranberry-tonic', name: 'Cranberry Tonic', price: 270 },
        ]
      }
    ],
    items: [], // Legacy flat fallback
  },
  {
    id: 'robusta-cold-milk',
    label: 'Robusta Specialty (Cold - Milk Based)',
    subCategories: [],
    group: 'Robusta Specialty',
    items: [
      { id: 'robusta-cold-milk-iced-latte', name: 'Iced Latte', price: 220 },
      { id: 'robusta-cold-milk-affogato', name: 'Affogato', price: 250 },
      { id: 'robusta-cold-milk-classic-frappe', name: 'Classic Frappe', price: 250 },
      { id: 'robusta-cold-milk-hazelnut', name: 'Hazelnut', price: 260 },
      { id: 'robusta-cold-milk-caramel', name: 'Caramel', price: 260 },
      { id: 'robusta-cold-milk-mocha', name: 'Mocha', price: 270 },
      { id: 'robusta-cold-milk-biscoff', name: 'Biscoff', price: 270 },
      { id: 'robusta-cold-milk-vietnamese', name: 'Vietnamese', price: 240 },
      { id: 'robusta-cold-milk-cafe-suda', name: 'Cafe Suda', price: 250 },
      { id: 'robusta-cold-milk-robco', name: 'Robco', price: 290 },
    ],
  },
  {
    id: 'robusta-hot-non-milk',
    label: 'Robusta Specialty (Hot - Non Milk)',
    group: 'Robusta Specialty',
    subCategories: [],
    items: [
      { id: 'robusta-hot-non-milk-hot-americano', name: 'Hot Americano', price: 150 },
      { id: 'robusta-hot-non-milk-hot-espresso', name: 'Hot Espresso', price: 130 },
    ],
  },
  {
    id: 'robusta-hot-milk',
    label: 'Robusta Specialty (Hot - Milk Based)',
    group: 'Robusta Specialty',
    subCategories: [],
    items: [
      { id: 'robusta-hot-milk-latte', name: 'Hot Latte', price: 190 },
      { id: 'robusta-hot-milk-flat-white', name: 'Hot Flat White', price: 180 },
      { id: 'robusta-hot-milk-cappuccino', name: 'Hot Cappuccino', price: 180 },
      { id: 'robusta-hot-milk-mocha', name: 'Robusta Mocha', price: 230 },
    ],
  },
  {
    id: 'blend-cold-non-milk',
    label: 'Blend (Cold - Non Milk)',
    group: 'Blend',
    subCategories: [],
    items: [
      { id: 'blend-cold-non-milk-iced-americano', name: 'Iced Americano', price: 150 },
      { id: 'blend-cold-non-milk-iced-espresso', name: 'Iced Espresso', price: 120 },
      {
        id: 'blend-cold-non-milk-iced-espresso-tonic',
        name: 'Iced Espresso (Tonic / Ginger Ale / Orange)',
        price: 230,
      },
      {
        id: 'blend-cold-non-milk-iced-espresso-red-bull',
        name: 'Iced Espresso (Red Bull)',
        price: 270,
      },
      { id: 'blend-cold-non-milk-cranberry-tonic', name: 'Cranberry Tonic', price: 250 },
    ],
  },
  {
    id: 'blend-cold-milk',
    label: 'Blend (Cold - Milk Based)',
    group: 'Blend',
    subCategories: [],
    items: [
      { id: 'blend-cold-milk-iced-latte', name: 'Iced Latte', price: 210 },
      { id: 'blend-cold-milk-affogato', name: 'Affogato', price: 240 },
      { id: 'blend-cold-milk-classic-frappe', name: 'Classic Frappe', price: 240 },
      { id: 'blend-cold-milk-hazelnut', name: 'Hazelnut', price: 250 },
      { id: 'blend-cold-milk-caramel', name: 'Caramel', price: 250 },
      { id: 'blend-cold-milk-mocha', name: 'Mocha', price: 260 },
      { id: 'blend-cold-milk-biscoff', name: 'Biscoff', price: 260 },
    ],
  },
  {
    id: 'blend-hot-non-milk',
    label: 'Blend (Hot - Non Milk)',
    group: 'Blend',
    subCategories: [],
    items: [
      { id: 'blend-hot-non-milk-hot-americano', name: 'Hot Americano', price: 140 },
      { id: 'blend-hot-non-milk-hot-espresso', name: 'Hot Espresso', price: 120 },
    ],
  },
  {
    id: 'blend-hot-milk',
    label: 'Blend (Hot - Milk Based)',
    group: 'Blend',
    subCategories: [],
    items: [
      { id: 'blend-hot-milk-latte', name: 'Hot Latte', price: 180 },
      { id: 'blend-hot-milk-flat-white', name: 'Hot Flat White', price: 170 },
      { id: 'blend-hot-milk-cappuccino', name: 'Hot Cappuccino', price: 170 },
      { id: 'blend-hot-milk-mocha', name: 'Blend Mocha', price: 220 },
    ],
  },
  {
    id: 'manual-brew',
    label: 'Manual Brew (Peaberry Special)',
    group: 'Manual Brew',
    subCategories: [],
    items: [
      { id: 'manual-brew-classic-cold-brew', name: 'Classic Cold Brew', price: 220 },
      {
        id: 'manual-brew-cold-brew-tonic',
        name: 'Cold Brew (Tonic / Ginger Ale / Orange)',
        price: 270,
      },
      {
        id: 'manual-brew-cold-brew-red-bull',
        name: 'Cold Brew (Red Bull)',
        price: 290,
      },
      { id: 'manual-brew-v60-hot', name: 'V60 Pour Over (Hot)', price: 220 },
      { id: 'manual-brew-v60-cold', name: 'V60 Pour Over (Cold)', price: 230 },
      {
        id: 'manual-brew-cranberry-cold-brew-tonic',
        name: 'Cranberry Cold Brew Tonic',
        price: 280,
      },
    ],
  },
  {
    id: 'shakes',
    label: 'Shakes',
    group: 'Shakes',
    subCategories: [],
    items: [
      { id: 'shake-chocolate', name: 'Chocolate', price: 220 },
      { id: 'shake-biscoff', name: 'Biscoff', price: 250 },
      { id: 'shake-nutella', name: 'Nutella', price: 260 },
    ],
  },
  {
    id: 'tea-cold',
    label: 'Tea (Cold)',
    group: 'Tea',
    subCategories: [],
    items: [
      { id: 'tea-lemon-ice', name: 'Lemon Ice Tea', price: 210 },
      { id: 'tea-peach-ice', name: 'Peach Ice Tea', price: 210 },
      { id: 'tea-ginger-fizz', name: 'Ginger Fizz', price: 250 },
      { id: 'tea-classic-orange-mint', name: 'Classic Orange Mint', price: 250 },
    ],
  },
  {
    id: 'food-bagels',
    label: 'Food & Bagels',
    group: 'Food & Bagels',
    subCategories: [],
    items: [
      { id: 'food-fries', name: 'Fries', price: 150 },
      { id: 'food-wedges', name: 'Potato Wedges', price: 170 },
      { id: 'food-veg-nuggets', name: 'Veg Nuggets', price: 190 },
      { id: 'food-pizza', name: 'Pizza', price: 300 },
      { id: 'food-bagel', name: 'Bagel', price: 100 },
      { id: 'food-cream-cheese-bagel', name: 'Cream Cheese Bagel', price: 150 },
      { id: 'food-jalapeno-cheese-bagel', name: 'Jalapeno Cheese Bagel', price: 200 },
      { id: 'food-pesto-bagel', name: 'Pesto Bagel', price: 230 },
      { id: 'food-butter-croissant', name: 'Butter Croissant', price: 150 },
      { id: 'food-nutella-croissant', name: 'Nutella Croissant', price: 200 },
      { id: 'food-cream-cheese-croissant', name: 'Cream Cheese Croissant', price: 240 },
    ],
  },
];

interface MenuPageProps {
  onAddToCart: (item: CoffeeItem) => void;
}

interface TrendingItem {
  id: string;
  name: string;
  category: string;
  price: number;
  caffeine: string;
  caffeine_mg?: number | null;
  milk_based?: number | null;
  calories?: number | null;
  shareable?: number | null;
  intensity_level?: string | null;
  image: string;
  description: string;
  tags?: string;
  recentOrderCount: number;
}

interface MenuPageProps {
  onAddToCart: (item: CoffeeItem) => void;
}

const MenuPage: React.FC<MenuPageProps> = ({ onAddToCart }) => {
  const { menuItems, orderSettings, menuLoading, checkOrderingStatus } = useDataContext();

  // Side Nav Logic
  const { scrollY } = useScroll();
  const [isSideMode, setIsSideMode] = useState(false);
  const [nearFooter, setNearFooter] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Threshold to switch to side mode (e.g. after hero section)
    const threshold = 400;
    if (latest > threshold && !isSideMode) {
      setIsSideMode(true);
    } else if (latest < threshold && isSideMode) {
      setIsSideMode(false);
    }

    // Check for footer proximity to hide side nav
    if (typeof document !== 'undefined') {
      const footerThreshold = document.documentElement.scrollHeight - window.innerHeight - 300; // 300px buffer
      if (latest > footerThreshold && !nearFooter) {
        setNearFooter(true);
      } else if (latest <= footerThreshold && nearFooter) {
        setNearFooter(false);
      }
    }
  });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const activeCategoryTimeoutRef = useRef<number | null>(null);
  const [showBrewDesk, setShowBrewDesk] = useState(false);

  // Status Popup State
  const [statusPopup, setStatusPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'error';
  }>({ isOpen: false, title: '', message: '', type: 'info' });

  const handleAddToCart = (item: CoffeeItem) => {
    // Check ordering status
    const status = checkOrderingStatus('menu');

    if (!status.allowed) {
      setStatusPopup({
        isOpen: true,
        title: status.reason === 'STORE_CLOSED' ? 'We are Closed' : 'Kitchen Paused',
        message: status.message || "We are not accepting orders at the moment.",
        type: 'info'
      });
      return;
    }

    onAddToCart(item);
    // Show toast
    setToastMessage(`${item.name} added to cart`);
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Fetch trending items
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/trending`);
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length >= 3) {
            setTrendingItems(data.items);
          } else {
            setTrendingItems([]);
          }
        } else {
          setTrendingItems([]);
        }
      } catch (error) {
        console.error('Error fetching trending items:', error);
        setTrendingItems([]);
      }
    };
    fetchTrending();
  }, []);

  // Auto-trigger BrewDesk popup on first visit
  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('brewDeskShown');
    if (!hasSeenPopup) {
      // Small delay to let page load/animate in
      const timer = setTimeout(() => {
        setShowBrewDesk(true);
        sessionStorage.setItem('brewDeskShown', 'true');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);


  // Helper for Veg Icon
  const VegIcon = () => (
    <div className="inline-flex items-center justify-center border border-green-600 p-[1px] w-3 h-3 mr-1.5 align-middle">
      <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
    </div>
  );

  const NonVegIcon = () => (
    <div className="inline-flex items-center justify-center border border-red-600 p-[1px] w-3 h-3 mr-1.5 align-middle">
      <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
    </div>
  );

  const JainIcon = () => (
    <div className="inline-flex items-center justify-center bg-yellow-500 w-3.5 h-3.5 mr-2 align-middle rounded-[2px] shrink-0">
      <span className="text-[10px] font-bold text-white leading-none">J</span>
    </div>
  );

  const DietIcon = ({ pref }: { pref?: string }) => {
    if (pref === 'jain') return <JainIcon />;
    if (pref === 'non veg' || pref === 'non-veg') return <NonVegIcon />;
    return <VegIcon />;
  };

  // --- RECOMMENDATION ENGINE ---
  const [recommendedItems, setRecommendedItems] = useState<CoffeeItem[]>([]);

  useEffect(() => {
    if (!menuItems || menuItems.length === 0) return;

    try {
      const rawOrders = window.localStorage.getItem('rabuste_recent_orders');
      if (!rawOrders) return;

      const recentOrders = JSON.parse(rawOrders);
      // Constraint: user must have at least 3 items/orders history to get recommendations
      // The prompt said "3 or more orders".
      if (!Array.isArray(recentOrders) || recentOrders.length < 3) {
        setRecommendedItems([]);
        return;
      }

      // 1. Flatten all purchased line items
      const purchasedItems = recentOrders.flatMap((o: any) => o.items || []);
      if (purchasedItems.length === 0) return;

      // 2. Analyze preferences
      const categoryCounts: Record<string, number> = {};
      const subCategoryCounts: Record<string, number> = {};
      const tagCounts: Record<string, number> = {};
      const purchasedIds = new Set(purchasedItems.map((i: any) => i.id));

      purchasedItems.forEach((pItem: any) => {
        // Match with full menu item to get rich data
        const fullItem = menuItems.find(m => m.id === pItem.id);
        if (fullItem) {
          // Count Category (Legacy or ID based)
          const cat = fullItem.category_name || fullItem.category || 'Unknown';
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

          // Count SubCategory/Group
          // In legacy data, 'notes' in cart often held the group, or we parse from category string
          const subCat = fullItem.sub_category_name || (fullItem.category ? fullItem.category.split('(')[0].trim() : (fullItem.category_name || 'Unknown'));
          subCategoryCounts[subCat] = (subCategoryCounts[subCat] || 0) + 1;

          // Count Tags
          // Support both array of objects or legacy string
          if (Array.isArray(fullItem.tags)) {
            fullItem.tags.forEach(t => {
              tagCounts[t.name] = (tagCounts[t.name] || 0) + 1;
            });
          } else if (typeof fullItem.tags_legacy === 'string') {
            fullItem.tags_legacy.split(',').forEach(t => {
              const tag = t.trim();
              if (tag) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
          }
        }
      });

      // Find top preferences
      const topSubCategory = Object.keys(subCategoryCounts).sort((a, b) => subCategoryCounts[b] - subCategoryCounts[a])[0];
      const topTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);
      const topTag = topTags.length > 0 ? topTags[0] : null;

      const recommendations: CoffeeItem[] = [];
      const addedIds = new Set<string>();

      // Rule 1: Familiar Favorite (Same SubCategory/Group, but different item if possible)
      // Filter menu items by top subcategory
      const sameGroupItems = menuItems.filter(m => {
        const mSub = m.sub_category_name || (m.category ? m.category.split('(')[0].trim() : (m.category_name || ''));
        return mSub === topSubCategory && !purchasedIds.has(m.id);
      });

      if (sameGroupItems.length > 0) {
        // Pick random
        const pick = sameGroupItems[Math.floor(Math.random() * sameGroupItems.length)];
        recommendations.push(toCoffeeItem(pick));
        addedIds.add(pick.id);
      } else {
        // If they bought everything in that group, maybe suggest one re-order? 
        // Or pick from 2nd top category. Let's pick a high rated item from same group even if bought.
        const sameGroupAll = menuItems.filter(m => {
          const mSub = m.sub_category_name || (m.category ? m.category.split('(')[0].trim() : (m.category_name || ''));
          return mSub === topSubCategory;
        });
        if (sameGroupAll.length > 0) {
          const pick = sameGroupAll[Math.floor(Math.random() * sameGroupAll.length)];
          if (!addedIds.has(pick.id)) {
            recommendations.push(toCoffeeItem(pick));
            addedIds.add(pick.id);
          }
        }
      }

      // Rule 2: Tag Match (Similar profile)
      if (topTag) {
        const tagMatchItems = menuItems.filter(m => {
          if (addedIds.has(m.id)) return false;
          let hasTag = false;
          if (Array.isArray(m.tags)) hasTag = m.tags.some(t => t.name === topTag);
          else if (typeof m.tags_legacy === 'string') hasTag = m.tags_legacy.includes(topTag);
          return hasTag;
        });

        if (tagMatchItems.length > 0) {
          const pick = tagMatchItems[Math.floor(Math.random() * tagMatchItems.length)];
          recommendations.push(toCoffeeItem(pick));
          addedIds.add(pick.id);
        }
      }

      // Rule 3: Variety / Wildcard (Different Category Group)
      // Pick something from a category NOT in their top 2 purchased categories
      const top2SubCats = Object.keys(subCategoryCounts).sort((a, b) => subCategoryCounts[b] - subCategoryCounts[a]).slice(0, 2);
      const varietyItems = menuItems.filter(m => {
        if (addedIds.has(m.id)) return false;
        const mSub = m.sub_category_name || (m.category ? m.category.split('(')[0].trim() : (m.category_name || ''));
        return !top2SubCats.includes(mSub);
      });

      if (varietyItems.length > 0) {
        const pick = varietyItems[Math.floor(Math.random() * varietyItems.length)];
        recommendations.push(toCoffeeItem(pick));
        addedIds.add(pick.id);
      }

      // Fill up if we don't have 3 recommendations yet
      if (recommendations.length < 3) {
        const remaining = menuItems.filter(m => !addedIds.has(m.id));
        while (recommendations.length < 3 && remaining.length > 0) {
          const idx = Math.floor(Math.random() * remaining.length);
          const pick = remaining[idx];
          recommendations.push(toCoffeeItem(pick));
          addedIds.add(pick.id);
          remaining.splice(idx, 1);
        }
      }

      setRecommendedItems(recommendations.slice(0, 3));

    } catch (err) {
      console.error('Error generating recommendations:', err);
    }
  }, [menuItems]);

  // Helper to convert Admin item to UI CoffeeItem
  const toCoffeeItem = (item: any): CoffeeItem => {
    const group = item.sub_category_name || (item.category ? item.category.split('(')[0].trim() : (item.category_name || 'Specialty'));

    // Resolve image: Use backend image if valid and not placeholder, else use local mapping
    let imageUrl = item.image;
    if (!imageUrl || imageUrl.includes('menu-placeholder') || imageUrl.includes('pic1.jpeg') || imageUrl.includes('pic2.jpeg') || imageUrl.includes('pic3.jpeg')) {
      imageUrl = getMenuImage(item.name);
    }

    return {
      id: item.id,
      name: item.name.replace(/_/g, ' '),
      notes: group,
      caffeine: item.caffeine || 'Medium',
      intensity: 4, // Default or derived
      image: imageUrl,
      price: item.price,
      description: (item.description || item.name).replace(/_/g, ' '),
      diet_pref: item.diet_pref
    };
  };
  // -----------------------------
  // -----------------------------

  // Calculate Levenshtein distance for string similarity
  const levenshteinDistance = (a: string, b: string): number => {
    const matrix = Array.from({ length: b.length + 1 }, () => Array(a.length + 1).fill(0));

    for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[b.length][a.length];
  };

  const getSimilarity = (s1: string, s2: string): number => {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;

    return (longerLength - levenshteinDistance(longer, shorter)) / longerLength;
  };

  const handleCategoryClick = (id: string) => {

    setSearch('');
    setActiveCategoryId(id);

    // Smooth scroll to the section after a short delay to ensure DOM update
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const yOffset = -180; // Offset for sticky navigation/header
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'auto' });
      }
    }, 100);
  };


  // Simple search helper - checks if query words are present in text
  const fuzzyMatch = (text: string, query: string): boolean => {
    if (!query) return true;
    const t = text.toLowerCase();
    const q = query.toLowerCase();

    const queryWords = q.split(/\s+/).filter(w => w.length > 0);
    if (queryWords.length === 0) return true;

    // Check if ALL query words are present in text (AND logic)
    return queryWords.every(word => t.includes(word));
  };

  // ALL CATEGORIES (for Sidebar) - independent of search
  const allCategories = useMemo(() => {
    const categoryMap = new Map<string, MenuCategory>();

    menuItems.forEach(item => {
      if (!item.name || item.price == null || !item.id) return;

      // Skip DRAFT items
      if (item.status === 'DRAFT') return;

      // Use safe defaults to ensure trim() is always called on a string
      const rawCategory = item.category || item.category_legacy || item.category_name || '';
      const categoryStr = rawCategory.trim();
      if (!categoryStr) return;

      // --- MAIN CATEGORY DETECTION ---
      // Determine Main Category (Coffee, Tea, etc.)
      let mainCategoryLabel = 'Other';
      const rawLower = rawCategory.toLowerCase();

      if (item.category_name) {
        mainCategoryLabel = item.category_name.toUpperCase().replace(/_/g, ' ');
      } else {
        // Fallback Heuristics
        if (rawLower.includes('robusta') || rawLower.includes('blend') || rawLower.includes('manual brew') || rawLower.includes('coffee') || rawLower.includes('espresso') || rawLower.includes('latte')) {
          mainCategoryLabel = 'COFFEE';
        } else if (rawLower.includes('tea')) {
          mainCategoryLabel = 'TEA';
        } else if (rawLower.includes('shake') || rawLower.includes('smoothie')) {
          mainCategoryLabel = 'SHAKE';
        } else if (rawLower.includes('food') || rawLower.includes('fries') || rawLower.includes('pizza') || rawLower.includes('croissant') || rawLower.includes('bagel')) {
          mainCategoryLabel = 'FOOD';
        } else if (rawLower.includes('legacy')) {
          mainCategoryLabel = 'OTHERS';
        } else {
          mainCategoryLabel = 'OTHERS'; // Default
        }
      }

      const mainId = mainCategoryLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      // --- SUB CATEGORY DETECTION ---
      let subCategoryLabel = 'General';
      if (item.sub_category_name) {
        subCategoryLabel = item.sub_category_name.replace(/_/g, ' ');
      } else {
        // Extract from parenthesis or legacy group
        // e.g. "Robusta Specialty (Cold - Non Milk)" -> "Robusta Specialty"
        // "Blend (Cold...)" -> "Blend"
        // "Manual Brew (Peaberry...)" -> "Manual Brew"
        const split = rawCategory.split('(');
        if (split.length > 0) {
          subCategoryLabel = split[0].trim().replace(/_/g, ' ');
        }
      }

      if (!categoryMap.has(mainId)) {
        categoryMap.set(mainId, {
          id: mainId,
          label: mainCategoryLabel,
          subCategories: [],
          items: [],
        });
      }

      const mainCat = categoryMap.get(mainId)!;

      // Add to flat items list (for search etc)
      const newItem = {
        id: item.id,
        name: item.name,
        price: item.price,
      };
      mainCat.items.push(newItem);

      // Add to Sub Category
      let subCat = mainCat.subCategories.find(s => s.title === subCategoryLabel);
      if (!subCat) {
        subCat = {
          id: `${mainId}-${subCategoryLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          title: subCategoryLabel,
          items: []
        };
        mainCat.subCategories.push(subCat);
      }
      subCat.items.push(newItem);
    });

    // Ensure strictly ordered categories if needed? 
    // Usually Coffee first.
    return Array.from(categoryMap.values()).sort((a, b) => {
      const order = ['COFFEE', 'TEA', 'REFRESHER', 'BREW', 'SHAKE', 'FOOD'];
      const idxA = order.indexOf(a.label);
      const idxB = order.indexOf(b.label);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
  }, [menuItems]);

  // Set default category to Coffee (or first available)
  const [didYouMean, setDidYouMean] = useState<string | null>(null);

  useEffect(() => {
    if (!activeCategoryId && allCategories.length > 0) {
      const coffee = allCategories.find(c => c.label.toUpperCase().includes('COFFEE'));
      if (coffee) {
        setActiveCategoryId(coffee.id);
      } else {
        setActiveCategoryId(allCategories[0].id);
      }
    }
  }, [allCategories, activeCategoryId]);




  const filteredCategories = useMemo(() => {
    const query = (search || '').trim().toLowerCase();

    // Reset suggestion
    // We can't set state directly in useMemo, so we'll just compute it and return it alongside, 
    // or use a separate effect. For now, let's keep logic pure here.
    // Actually, setting state in useMemo is bad. Let's do suggestion check after filtering.

    // 1. First, select the base categories (either all or specific active one)
    let baseCategories = allCategories;

    // Only filter by active category if NOT searching. 
    // If searching, we want to search EVERYTHING.
    if (!query && activeCategoryId && activeCategoryId !== 'all') { // Added 'all' check just in case
      baseCategories = allCategories.filter(c => c.id === activeCategoryId);
    }

    // 2. Apply Search Filter if query exists
    let processedCategories = baseCategories;

    if (query) {
      processedCategories = baseCategories.map(category => {
        // Deep clone subcategories and filter their items
        const filteredSubCategories = category.subCategories.map(sub => {
          const filteredItems = sub.items.filter(item => {
            const fullItem = menuItems.find(m => m.id === item.id) || item as any;
            const nameStr = (fullItem.name ?? '').toLowerCase();
            const categoryStr = (fullItem.category || fullItem.category_legacy || fullItem.category_name || '').toLowerCase();
            const groupStr = (fullItem.sub_category_name || '').toLowerCase();
            const combinedText = `${nameStr} ${categoryStr} ${groupStr}`;
            return fuzzyMatch(combinedText, query);
          });
          return { ...sub, items: filteredItems };
        }).filter(sub => sub.items.length > 0);

        // Also filter category.items (flat fallback)
        const filteredFlatItems = category.items.filter(item => {
          const fullItem = menuItems.find(m => m.id === item.id) || item as any;
          const nameStr = (fullItem.name ?? '').toLowerCase();
          const categoryStr = (fullItem.category || fullItem.category_legacy || fullItem.category_name || '').toLowerCase();
          const combinedText = `${nameStr} ${categoryStr}`;
          return fuzzyMatch(combinedText, query);
        });

        return {
          ...category,
          subCategories: filteredSubCategories,
          items: filteredFlatItems
        };
      }).filter(category => category.subCategories.length > 0 || category.items.length > 0);
    }

    // 3. Apply Sorting (Always applies, even if no search)
    if (sortBy === 'price-asc' || sortBy === 'price-desc') {
      processedCategories = processedCategories.map(category => {
        // Sort items in subcategories
        const sortedSubCategories = category.subCategories.map(sub => ({
          ...sub,
          items: [...sub.items].sort((a, b) => {
            const priceA = Number(a.price) || 0;
            const priceB = Number(b.price) || 0;
            return sortBy === 'price-asc' ? priceA - priceB : priceB - priceA;
          })
        }));

        // Sort flat items
        const sortedItems = [...category.items].sort((a, b) => {
          const priceA = Number(a.price) || 0;
          const priceB = Number(b.price) || 0;
          return sortBy === 'price-asc' ? priceA - priceB : priceB - priceA;
        });

        return { ...category, subCategories: sortedSubCategories, items: sortedItems };
      });
    }

    return processedCategories;

  }, [allCategories, menuItems, search, sortBy, activeCategoryId]);


  // Effect for "Did You Mean"
  useEffect(() => {
    const query = search.trim().toLowerCase();

    // Debug log
    // console.log('Search:', query, 'Results:', filteredCategories.length);

    // If we have exact results, or search is empty, don't suggested
    if (!query || filteredCategories.length > 0) {
      setDidYouMean(null);
      return;
    }

    // If no results, find closest match
    let bestMatch = '';
    let highestSimilarity = 0;

    menuItems.forEach(item => {
      const name = (item.name || '').toLowerCase();
      // 1. Calculate similarity with full name
      let score = getSimilarity(name, query);

      // 2. Calculate max similarity with individual words (for cases like "fij" -> "Ginger Fizz")
      const words = name.split(/\s+/);
      for (const word of words) {
        if (word.length < 3) continue; // Skip small words
        const wordSim = getSimilarity(word, query);
        if (wordSim > score) {
          score = wordSim;
        }
      }

      if (score > highestSimilarity) {
        highestSimilarity = score;
        bestMatch = item.name;
      }
    });

    // User requirement: "at least 40% of them right" -> Relaxed to 0.35
    if (highestSimilarity >= 0.35 && highestSimilarity < 1.0) {
      setDidYouMean(bestMatch);
    } else {
      setDidYouMean(null);
    }

  }, [search, filteredCategories, menuItems]);


  return (
    <div
      className="pt-24 md:pt-32 pb-40 px-6 md:px-8 bg-[#F3EFE0] min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        {orderSettings && !orderSettings.menu_orders_enabled && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-800 flex items-center justify-center gap-2 rounded-sm">
            <div className="w-2 h-2 rounded-full bg-red-600" />
            <span className="text-xs font-bold uppercase tracking-widest">Currently not accepting menu orders</span>
          </div>
        )}
        {/* NEW HEADER - Community Style (Wide) */}
        <header
          className="mb-20 md:mb-32 flex flex-col md:flex-row justify-between items-end gap-6 md:gap-10"
        >
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-[10px] md:text-[13px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-black mb-4 md:mb-6"
            >
              Curated Selections
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-9xl font-serif italic tracking-tighter leading-none"
            >
              The Menu.
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-xs text-[14px] md:text-s font-sans text-black uppercase tracking-widest leading-relaxed text-right italic"
          >
            "Flavor is a language, and every dish tells a story of origin and craft."
          </motion.p>
        </header>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Mobile Navigation (Sticky Top) - Optional, keeping for usability but centered relative to content? 
            Or maybe remove since user asked for Community layout which doesn't have sticky nav typically.
            But Menu is long... let's keep it but make it blend in or cleaner.
        */}
        {/* Navigation System (Top Sticky -> Side Fixed) */}
        {!menuLoading && (
          <>
            {/* Top Navigation (Visible when NOT in Side Mode) */}
            <AnimatePresence>
              {!isSideMode && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="relative bg-[#F3EFE0]/60 backdrop-blur-md py-5 mb-12 -mx-6 md:mx-0 md:px-0 shadow-sm"
                >
                  <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar snap-x scroll-pl-6 justify-start md:justify-center">
                    <div className="w-6 shrink-0 md:hidden" />
                    {allCategories.map((cat) => {
                      const isActive = activeCategoryId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryClick(cat.id)}
                          className={`relative shrink-0 py-3 rounded-full text-base font-medium font-sans border snap-start transition-all duration-300 px-8
                            ${isActive ? 'text-[#F9F8F4] border-[#B5693E]' : 'bg-white border-black/30 text-black hover:bg-black hover:text-white hover:border-black'}`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeCategoryTop"
                              className="absolute inset-0 bg-[#B5693E] rounded-full"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          <span className="relative z-10 capitalize tracking-wide">{cat.label.toLowerCase()}</span>
                        </button>
                      );
                    })}
                    <div className="w-6 shrink-0 md:hidden" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Side Navigation (Visible when IN Side Mode) - Desktop Only */}
            <AnimatePresence>
              {isSideMode && !nearFooter && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="fixed top-0 left-0 h-full w-auto z-40 hidden lg:flex flex-col justify-center pl-10 gap-8 pointer-events-none"
                >
                  <div className="pointer-events-auto flex flex-col gap-6">
                    {allCategories.map((cat) => {
                      const isActive = activeCategoryId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryClick(cat.id)}
                          className="group flex items-center transition-all duration-300"
                        >
                          {/* Text Label */}
                          <span className={`text-lg font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-colors duration-300
                              ${isActive ? 'text-[#B5693E]' : 'text-zinc-500 group-hover:text-zinc-800'}`}>
                            {cat.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>



          </>
        )}


        {/* Right Content -> Main Content (Centered) */}
        <main>
          {/* Unified Premium Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-16 border-b border-black/5 pb-8"
          >
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8 xl:gap-12">

              {/* Left: Search Bar (Dominant) */}
              <div className="relative w-full xl:max-w-xl group">
                <Search className="w-5 h-5 text-zinc-400 absolute left-0 top-1/2 -translate-y-1/2 group-focus-within:text-black transition-colors" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search menu..."
                  className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-black/10 text-lg font-serif italic text-black placeholder:text-black/60 outline-none focus:border-black/40 transition-colors"
                />
              </div>

              {/* Right: Actions Cluster */}
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 xl:gap-10">

                {/* 1. CTA Button (Now First) */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setShowBrewDesk(true)}
                  className="px-6 py-3 rounded-full bg-[#B5693E] text-[#F9F8F4] text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-[#a05530] shadow-sm hover:shadow-md whitespace-nowrap transition-all"
                >
                  Help me choose
                </motion.button>

                {/* 2. Dietary Key */}
                <div className="flex items-center gap-4 text-xs font-sans text-black uppercase tracking-widest md:border-l md:border-black/10 md:pl-8">
                  <span className="hidden md:inline text-black font-semibold">Key:</span>

                  <div className="flex flex-wrap md:flex-nowrap items-center gap-x-6 gap-y-3 md:gap-x-4 md:gap-y-0">
                    <div className="flex items-center gap-2" title="Jain">
                      <span className="inline-flex items-center justify-center bg-[#E69F31] text-white w-5 h-5 text-[10px] font-bold rounded-[2px] shrink-0">J</span>
                      <span className="text-sm font-medium text-zinc-600">Jain</span>
                    </div>

                    <div className="flex items-center gap-2" title="Vegetarian">
                      <div className="inline-flex items-center justify-center border border-green-600 p-[2px] w-5 h-5 rounded-[2px] shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-600"></div>
                      </div>
                      <span className="text-sm font-medium text-zinc-600">Veg</span>
                    </div>

                    <div className="flex items-center gap-2" title="Non-Vegetarian">
                      <div className="inline-flex items-center justify-center border border-red-600 p-[2px] w-5 h-5 rounded-[2px] shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
                      </div>
                      <span className="text-sm font-medium text-zinc-600 whitespace-nowrap">Non-Veg</span>
                    </div>


                  </div>
                </div>

                {/* 3. Sort Dropdown (Now Last) */}
                {/* 3. Sort Dropdown (Now Last) */}
                <CustomDropdown
                  value={sortBy}
                  onChange={(val) => setSortBy(val as any)}
                  options={[
                    { value: 'default', label: 'Sort by' },
                    { value: 'price-asc', label: 'Price: Low to High' },
                    { value: 'price-desc', label: 'Price: High to Low' },
                  ]}
                  minimal
                  triggerIcon={<Filter className="w-4 h-4 text-black" />}
                  className="group"
                />
              </div>
            </div>
          </motion.div>

          {/* Sections list */}
          <div className="space-y-16">
            {/* Did You Mean Suggestion */}
            {search && didYouMean && (
              <div className="mb-2">
                <p className="text-sm font-sans text-black">
                  Did you mean <button onClick={() => setSearch(didYouMean)} className="font-semibold underline text-black hover:text-black/80">{didYouMean}</button>?
                </p>
              </div>
            )}

            {/* Recommended Section (Personalized) */}
            {(!search && recommendedItems.length > 0) && (
              <section id="recommended-for-you" className="scroll-mt-36 mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="mb-8 text-center md:text-left md:ml-[3.75%]"
                >
                  <p className="text-[10px] uppercase tracking-[0.4em] text-black font-stardom mb-1">
                    picked for you
                  </p>
                  <h2 className="text-5xl md:text-7xl font-stardom italic tracking-tight text-black">
                    Recommended
                  </h2>
                </motion.div>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-5%" }}
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.1,
                        ease: "easeOut"
                      }
                    }
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12"
                >
                  {recommendedItems.map((item, idx) => {
                    const isVeg = item.diet_pref === 'veg' || item.diet_pref === 'jain';

                    // Resolve image
                    let imageUrl = item.image;
                    if (!imageUrl || imageUrl.includes('menu-placeholder') || imageUrl.includes('pic1.jpeg') || imageUrl.includes('pic2.jpeg') || imageUrl.includes('pic3.jpeg')) {
                      imageUrl = getMenuImage(item.name);
                    }

                    const cartItem = {
                      ...item,
                      image: imageUrl
                    };

                    return (
                      <MenuProductCard
                        key={`rec-${item.id}`}
                        item={cartItem}
                        index={idx}
                        onAddToCart={handleAddToCart}
                      />
                    );
                  })}
                </motion.div>
              </section>
            )}

            {/* Trending Now Section */}
            {trendingItems.length >= 3 && (
              <section
                id="trending-now"
                className="scroll-mt-36"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative mb-8 text-center md:text-left md:ml-[3.75%]"
                >
                  <h2 className="text-5xl md:text-7xl font-stardom italic tracking-tight">
                    Trending Now
                  </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                  {trendingItems.map(item => {
                    // Find the category group for this item
                    if (!item.category || !item.name || !item.id || item.price == null) return null; // Skip items without required fields
                    const categoryStr = (item.category ?? '').trim();
                    if (!categoryStr) return null; // Skip if category is empty after trimming
                    const canonicalCategory = categoryStr.toUpperCase();
                    const group = (canonicalCategory.split('(')[0] ?? '').trim();

                    // Resolve image
                    let imageUrl = item.image;
                    if (!imageUrl || imageUrl.includes('menu-placeholder') || imageUrl.includes('pic1.jpeg') || imageUrl.includes('pic2.jpeg') || imageUrl.includes('pic3.jpeg')) {
                      imageUrl = getMenuImage(item.name);
                    }

                    const cartItem: CoffeeItem = {
                      id: item.id,
                      name: item.name,
                      notes: group,
                      caffeine: item.caffeine || 'High',
                      intensity: 4,
                      image: imageUrl,
                      price: item.price,
                      description: item.description || item.category || item.name,
                      diet_pref: item.diet_pref,
                    };

                    const isVeg = item.diet_pref === 'veg' || item.diet_pref === 'jain';


                    return (
                      <MenuProductCard
                        key={item.id}
                        item={cartItem}
                        index={0} // No stagger needed or simple 0
                        onAddToCart={handleAddToCart}
                      />
                    );
                  })}
                </div>
              </section>
            )}
            {filteredCategories.length === 0 && !search && (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-xl font-serif italic text-black/50">Loading menu directory...</p>
                <p className="text-sm font-sans text-black/30 mt-2">If this persists, please check your network connection.</p>
              </div>
            )}
            {filteredCategories.map(category => (
              <section
                key={category.id}
                id={category.id}
                data-category-id={category.id}
                className="scroll-mt-36"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="mb-6 mt-4 text-center md:text-left md:ml-[3.75%]"
                >
                  <h2 className="text-5xl md:text-7xl font-stardom italic tracking-tight">
                    {category.label}
                  </h2>
                </motion.div>

                <div className="space-y-16">
                  {category.subCategories.length > 0 ? (
                    category.subCategories.map(subCategory => (
                      <div key={subCategory.id}>
                        <motion.h3
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: "-5%" }}
                          transition={{ duration: 0.5 }}
                          className="text-3xl md:text-4xl font-stardom italic text-[#B5693E] mb-12 capitalize ml-[7.5%] md:ml-[3.75%]"
                        >
                          {subCategory.title}
                        </motion.h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
                          {subCategory.items.map((item, idx) => {
                            const fullItem = menuItems.find(m => m.id === item.id) || item as any;

                            // Resolve image
                            let imageUrl = fullItem.image;
                            if (!imageUrl || imageUrl.includes('menu-placeholder') || imageUrl.includes('pic1.jpeg') || imageUrl.includes('pic2.jpeg') || imageUrl.includes('pic3.jpeg')) {
                              imageUrl = getMenuImage(fullItem.name);
                            }

                            const cartItem: CoffeeItem = {
                              id: fullItem.id,
                              name: fullItem.name,
                              notes: fullItem.category || '',
                              caffeine: fullItem.caffeine || 'Medium',
                              intensity: 4,
                              image: imageUrl,
                              price: fullItem.price,
                              description: fullItem.description || fullItem.category || fullItem.name,
                              diet_pref: fullItem.diet_pref
                            };

                            return (
                              <MenuProductCard
                                key={item.id}
                                item={cartItem}
                                index={idx}
                                onAddToCart={handleAddToCart}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    // Fallback for items without valid sub-categories or if logic fails
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                      {category.items.map((item, idx) => {
                        const fullItem = menuItems.find(m => m.id === item.id) || item as any;

                        // Resolve image
                        let imageUrl = fullItem.image;
                        if (!imageUrl || imageUrl.includes('menu-placeholder') || imageUrl.includes('pic1.jpeg') || imageUrl.includes('pic2.jpeg') || imageUrl.includes('pic3.jpeg')) {
                          imageUrl = getMenuImage(fullItem.name);
                        }

                        const cartItem: CoffeeItem = {
                          id: fullItem.id,
                          name: fullItem.name,
                          notes: fullItem.category || '',
                          caffeine: fullItem.caffeine || 'Medium',
                          intensity: 4,
                          image: imageUrl,
                          price: fullItem.price,
                          description: fullItem.description || fullItem.category || fullItem.name,
                          diet_pref: fullItem.diet_pref
                        };

                        return (
                          <MenuProductCard
                            key={item.id}
                            item={cartItem}
                            index={idx}
                            onAddToCart={handleAddToCart}
                          />
                        );
                      })}
                    </div>
                  )}
                </div >
              </section >
            ))}
          </div >
        </main >
      </div >
      {
        typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {showBrewDesk && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={() => setShowBrewDesk(false)}
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative z-[10000] w-full max-w-6xl mx-4"
                >
                  <BrewDeskPopup onClose={() => setShowBrewDesk(false)} onAddToCart={handleAddToCart} />
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )
      }


      <StatusPopup
        isOpen={statusPopup.isOpen}
        onClose={() => setStatusPopup(prev => ({ ...prev, isOpen: false }))}
        title={statusPopup.title}
        message={statusPopup.message}
        type={statusPopup.type}
      />

      <Toast message={toastMessage} />
    </div>
  );
};


export default MenuPage;
