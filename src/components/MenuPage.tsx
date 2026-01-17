
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion as motionBase, AnimatePresence } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import { CoffeeItem } from '../types';
import { useDataContext } from '../DataContext';
import BrewDeskPopup from './BrewDeskPopup';
import { API_BASE_URL } from '../config';
import Toast from './Toast';

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
    items: [
      { id: 'robusta-hot-non-milk-hot-americano', name: 'Hot Americano', price: 150 },
      { id: 'robusta-hot-non-milk-hot-espresso', name: 'Hot Espresso', price: 130 },
    ],
  },
  {
    id: 'robusta-hot-milk',
    label: 'Robusta Specialty (Hot - Milk Based)',
    group: 'Robusta Specialty',
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
    items: [
      { id: 'blend-hot-non-milk-hot-americano', name: 'Hot Americano', price: 140 },
      { id: 'blend-hot-non-milk-hot-espresso', name: 'Hot Espresso', price: 120 },
    ],
  },
  {
    id: 'blend-hot-milk',
    label: 'Blend (Hot - Milk Based)',
    group: 'Blend',
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

const MenuPage: React.FC<MenuPageProps> = ({ onAddToCart }) => {
  const { menuItems } = useDataContext();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const activeCategoryTimeoutRef = useRef<number | null>(null);
  const [showBrewDesk, setShowBrewDesk] = useState(false);
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

  // --- HELPER: VEGETARIAN LOGIC ---
  const isVegetarian = (item: { name?: string; tags?: string | any[]; category?: string }): boolean => {
    // Default to veg unless identified otherwise
    const text = ((item.name || '') + ' ' + (item.category || '')).toLowerCase();

    // Explicit non-veg keywords
    const nonVegKeywords = ['chicken', 'lamb', 'fish', 'prawn', 'egg', 'meat', 'beef', 'pork'];
    if (nonVegKeywords.some(k => text.includes(k))) return false;

    // Explicit veg keywords (optional, for confirmation if needed, but we default to true if no meat found)
    // const vegKeywords = ['veg', 'paneer', 'cheese', 'mushroom', 'potato', 'corn', 'spinach'];

    // Check tags if available
    if (Array.isArray(item.tags)) {
      if (item.tags.some(t => t.name.toLowerCase() === 'non-veg')) return false;
    } else if (typeof item.tags === 'string') {
      if (item.tags.toLowerCase().includes('non-veg')) return false;
    }

    return true;
  };

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
    return {
      id: item.id,
      name: item.name,
      notes: group,
      caffeine: item.caffeine || 'Medium',
      intensity: 4, // Default or derived
      image: item.image || '/media/menu-placeholder.jpg',
      price: item.price,
      description: item.description || item.name
    };
  };
  // -----------------------------

  // Calculate Levenshtein distance for string similarity
  const levenshteinDistance = (a: string, b: string): number => {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }

    return matrix[b.length][a.length];
  };

  const getSimilarity = (s1: string, s2: string): number => {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    const longerLength = longer.length;
    if (longerLength === 0) {
      return 1.0;
    }
    return (longerLength - levenshteinDistance(longer, shorter)) / parseFloat(longerLength.toString());
  };

  const handleCategoryClick = (id: string) => {
    setActiveCategoryId(id);
    const el = document.getElementById(id);
    /* 
       With tab layout, scrolling might not be needed if we render only one, 
       but if we scroll to top of list it's fine. 
       Actually with Tabs, we are likely replacing the content.
       So scroll to top of container? 
       Let's keep scroll but remove timeout.
    */
    /* window.scrollTo({ top: 0, behavior: 'smooth' }); // Optional */
  };

  const handleAddToCart = (category: MenuCategory, item: MenuItem) => {
    const cartItem: CoffeeItem = {
      id: item.id,
      name: item.name,
      notes: category.group,
      caffeine: 'High',
      intensity: 4,
      image: '/media/menu-placeholder.jpg',
      price: item.price,
      description: `${category.label} - ${item.name}`,
    };

    onAddToCart(cartItem);
    setToastMessage(`${item.name} added to cart`);

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 1500);
  };

  // Fuzzy search helper - checks if query is similar to text (handles typos)
  const fuzzyMatch = (text: string, query: string): boolean => {
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();

    // Exact substring match (highest priority)
    if (textLower.includes(queryLower)) return true;

    // If query is too short, only do exact match
    if (queryLower.length < 3) return false;

    // Normalize: remove special characters and spaces
    const normalizedText = textLower.replace(/[^a-z0-9]/g, '');
    const normalizedQuery = queryLower.replace(/[^a-z0-9]/g, '');

    // Check if normalized query is a substring of normalized text
    if (normalizedText.includes(normalizedQuery)) return true;

    // Only do fuzzy matching for queries 4+ characters to avoid false matches
    if (normalizedQuery.length < 4) return false;

    // Split into words for word-by-word matching (prevents "tea" matching "coffee")
    const textWords = textLower.split(/[\s\-_]+/).filter(w => w.length > 0);
    const queryWords = queryLower.split(/[\s\-_]+/).filter(w => w.length > 0);

    // Check if ALL query words match at least one text word (AND logic)
    for (const queryWord of queryWords) {
      if (queryWord.length < 3) continue; // Skip very short words

      let wordMatched = false;

      for (const textWord of textWords) {
        // Exact match in word
        if (textWord.includes(queryWord)) {
          wordMatched = true;
          break;
        }

        // Only do fuzzy matching if words are similar length (within 2 chars)
        if (Math.abs(textWord.length - queryWord.length) > 2) continue;

        // Check if words share the same first 2-3 characters (prefix match)
        // This prevents "tea" from matching "coffee" (different prefixes)
        const minPrefix = Math.min(3, Math.min(textWord.length, queryWord.length));
        if (textWord.substring(0, minPrefix) !== queryWord.substring(0, minPrefix)) {
          continue; // Different words, skip fuzzy matching
        }

        // For words that share a prefix, allow common typos
        const normalizedTextWord = textWord.replace(/[^a-z0-9]/g, '');
        const normalizedQueryWord = queryWord.replace(/[^a-z0-9]/g, '');

        // Common character swaps only for similar words
        const commonSwaps: [string, string][] = [
          ['ee', 'e'], ['e', 'ee'], // coffee/cofee
          ['a', 'e'], ['e', 'a'], // bagel/begel
        ];

        for (const [from, to] of commonSwaps) {
          const swappedQuery = normalizedQueryWord.replace(new RegExp(from, 'g'), to);
          if (normalizedTextWord.includes(swappedQuery) || swappedQuery.includes(normalizedTextWord)) {
            wordMatched = true;
            break;
          }
        }
        if (wordMatched) break;

        // For longer words (5+ chars), allow 1 character difference if they're very similar
        if (normalizedQueryWord.length >= 5 && normalizedTextWord.length >= 5) {
          // Count matching characters in order
          let matchingChars = 0;
          let textIndex = 0;
          for (let i = 0; i < normalizedQueryWord.length && textIndex < normalizedTextWord.length; i++) {
            if (normalizedTextWord[textIndex] === normalizedQueryWord[i]) {
              matchingChars++;
              textIndex++;
            } else if (textIndex + 1 < normalizedTextWord.length &&
              normalizedTextWord[textIndex + 1] === normalizedQueryWord[i]) {
              // Allow skipping one character
              textIndex += 2;
              matchingChars++;
            }
          }
          // Only match if at least 80% of query characters match (very strict)
          const matchRatio = matchingChars / normalizedQueryWord.length;
          if (matchRatio >= 0.8) {
            wordMatched = true;
            break;
          }
        }
      }

      if (!wordMatched) return false;
    }

    return true;
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
        mainCategoryLabel = item.category_name.toUpperCase();
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
        subCategoryLabel = item.sub_category_name;
      } else {
        // Extract from parenthesis or legacy group
        // e.g. "Robusta Specialty (Cold - Non Milk)" -> "Robusta Specialty"
        // "Blend (Cold...)" -> "Blend"
        // "Manual Brew (Peaberry...)" -> "Manual Brew"
        const split = rawCategory.split('(');
        if (split.length > 0) {
          subCategoryLabel = split[0].trim();
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

  const [didYouMean, setDidYouMean] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    const query = (search || '').trim().toLowerCase();

    // Reset suggestion
    // We can't set state directly in useMemo, so we'll just compute it and return it alongside, 
    // or use a separate effect. For now, let's keep logic pure here.
    // Actually, setting state in useMemo is bad. Let's do suggestion check after filtering.

    // If no search query, return filter by activeCategoryId
    if (!query) {
      if (activeCategoryId) {
        return allCategories.filter(c => c.id === activeCategoryId);
      }
      return allCategories;
    }

    const categories = allCategories.map(cat => ({ ...cat, items: [] as MenuItem[] })); // Deep clone structure with empty items

    // We also need to map items back from allCategories structure or re-filter menuItems.
    // Re-filtering menuItems is safer for search.

    const matchedCategoriesMap = new Map<string, MenuCategory>();
    // Pre-fill map from allCategories to keep order and metadata
    allCategories.forEach(c => matchedCategoriesMap.set(c.label, { ...c, items: [] }));

    let hasExactMatches = false;

    menuItems.forEach(item => {
      // duplicates logic from above but that's fine for safety
      if (!item.name || item.price == null || !item.id) return;
      const rawCategory = item.category || item.category_legacy || item.category_name || '';
      const categoryStr = rawCategory.trim();
      if (!categoryStr) return;
      const canonicalCategory = categoryStr.toUpperCase();

      // Search
      const nameStr = (item.name ?? '').toLowerCase();
      const groupSource = item.sub_category_name || rawCategory;
      const group = (groupSource.split('(')[0] ?? '').trim();

      // Improved Search Logic:
      // 1. Check strict substring/fuzzy match
      const combinedText = `${nameStr} ${categoryStr.toLowerCase()} ${group.toLowerCase()}`;

      if (fuzzyMatch(combinedText, query)) {
        hasExactMatches = true;
        if (matchedCategoriesMap.has(canonicalCategory)) {
          matchedCategoriesMap.get(canonicalCategory)!.items.push({
            id: item.id,
            name: item.name,
            price: item.price
          });
        }
      }
    });

    // If we have matches, great. If not, check "Did you mean?"
    // We need to look for a potential match in all items if result is empty OR if matches are weak?
    // Requirement: "while searching... if there is under 60% similarity... did you mean"
    // This implies we check similarity against available items.

    // Let's filter out empty categories
    let results = Array.from(matchedCategoriesMap.values()).filter(c => c.items.length > 0);

    // If NO search query, treat as Tabs: Filter by activeCategoryId
    if (!query && activeCategoryId) {
      results = results.filter(c => c.id === activeCategoryId);
    }

    // Sort logic
    if (sortBy === 'price-asc' || sortBy === 'price-desc') {
      const sorted = results.map(category => {
        const sortedItems = [...category.items].sort((a, b) =>
          sortBy === 'price-asc' ? a.price - b.price : b.price - a.price
        );
        return { ...category, items: sortedItems };
      });
      return sorted;
    }

    return results;

  }, [allCategories, menuItems, search, sortBy, activeCategoryId]);

  // Effect for "Did You Mean"
  useEffect(() => {
    const query = search.trim().toLowerCase();

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
      // Calculate similarity
      const sim = getSimilarity(name, query);

      if (sim > highestSimilarity) {
        highestSimilarity = sim;
        bestMatch = item.name;
      }
    });

    // User requirement: "at least 40% of them right". 
    // We use >= 0.4 threshold.
    if (highestSimilarity >= 0.4 && highestSimilarity < 1.0) {
      setDidYouMean(bestMatch);
    } else {
      setDidYouMean(null);
    }

  }, [search, filteredCategories, menuItems]);

  return (
    <div className="pt-24 md:pt-32 pb-40 px-6 md:px-8 bg-[#F3EFE0] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* NEW HEADER - Community Style (Wide) */}
        <header className="mb-20 md:mb-32 flex flex-col md:flex-row justify-between items-end gap-6 md:gap-10">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] md:text-[13px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-black mb-4 md:mb-6"
            >
              Curated Selections
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-9xl font-serif italic tracking-tighter leading-none"
            >
              The Menu.
            </motion.h1>
          </div>
          <p className="max-w-xs text-[14px] md:text-s font-sans text-black uppercase tracking-widest leading-relaxed text-right italic">
            "Flavor is a language, and every dish tells a story of origin and craft."
          </p>
        </header>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Mobile Navigation (Sticky Top) - Optional, keeping for usability but centered relative to content? 
            Or maybe remove since user asked for Community layout which doesn't have sticky nav typically.
            But Menu is long... let's keep it but make it blend in or cleaner.
        */}
        <div className="sticky top-24 z-30 bg-[#F3EFE0]/95 backdrop-blur-sm py-4 mb-10 -mx-6 px-6 md:mx-0 md:px-0 border-b border-black/5">
          <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar snap-x justify-start md:justify-center">
            {/* Removed All Button */}
            {allCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`shrink-0 px-6 py-3 rounded-full text-xs uppercase tracking-[0.2em] font-bold font-sans border transition-colors snap-start ${activeCategoryId === cat.id
                  ? 'bg-[#B5693E] text-[#F9F8F4] border-[#B5693E]'
                  : 'bg-white border-black/10 text-zinc-600'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>


        {/* Right Content -> Main Content (Centered) */}
        <main>
          {/* Unified Premium Toolbar */}
          <div className="mb-16 border-b border-black/5 pb-8">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8 xl:gap-12">

              {/* Left: Search Bar (Dominant) */}
              <div className="relative w-full xl:max-w-xl">
                <Search className="w-5 h-5 text-zinc-400 absolute left-0 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-black" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search menu..."
                  className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-black/10 text-lg font-serif italic text-[#1A1A1A] placeholder:text-zinc-400 outline-none focus:border-black/40 transition-all"
                />
              </div>

              {/* Right: Actions Cluster */}
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 xl:gap-10">

                {/* 1. Sort Dropdown */}
                <div className="flex items-center gap-3 group cursor-pointer">
                  <Filter className="w-4 h-4 text-zinc-400 group-hover:text-black transition-colors" />
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as any)}
                      className="appearance-none bg-transparent py-2 pr-8 text-xs font-sans uppercase tracking-[0.2em] text-zinc-600 outline-none cursor-pointer group-hover:text-black transition-colors"
                    >
                      <option value="default">Sort by</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                  </div>
                </div>

                {/* 2. Dietary Key (Inline) */}
                <div className="flex items-center gap-4 text-[10px] font-sans text-zinc-500 uppercase tracking-widest border-l border-black/10 pl-0 md:pl-8 xl:border-l-0 xl:pl-0">
                  <span className="hidden md:inline text-zinc-300">Key:</span>

                  <div className="flex items-center gap-2" title="Jain">
                    <span className="inline-flex items-center justify-center bg-[#E69F31] text-white w-4 h-4 text-[9px] font-bold rounded-[2px]">J</span>
                    <span className="hidden lg:inline">Jain</span>
                  </div>

                  <div className="flex items-center gap-2" title="Vegetarian">
                    <div className="inline-flex items-center justify-center border border-green-600 p-[2px] w-4 h-4 rounded-[2px]">
                      <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    </div>
                    <span className="hidden lg:inline">Veg</span>
                  </div>

                  <div className="flex items-center gap-2" title="Non-Vegetarian">
                    <div className="inline-flex items-center justify-center border border-red-600 p-[2px] w-4 h-4 rounded-[2px]">
                      <div className="w-2 h-2 rounded-full bg-red-600"></div>
                    </div>
                    <span className="hidden lg:inline">Non-Veg</span>
                  </div>
                </div>

                {/* 3. CTA Button */}
                <button
                  type="button"
                  onClick={() => setShowBrewDesk(true)}
                  className="px-6 py-3 rounded-full bg-[#B5693E] text-[#F9F8F4] text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-[#a05530] transition-colors shadow-sm hover:shadow-md whitespace-nowrap"
                >
                  Help me choose
                </button>
              </div>
            </div>
          </div>

          {/* Sections list */}
          <div className="space-y-16">
            {/* Did You Mean Suggestion */}
            {search && didYouMean && (
              <div className="mb-2">
                <p className="text-sm font-sans text-zinc-600">
                  Did you mean <button onClick={() => setSearch(didYouMean)} className="font-semibold underline text-black hover:text-zinc-800">{didYouMean}</button>?
                </p>
              </div>
            )}

            {/* Recommended Section (Personalized) */}
            {(!search && recommendedItems.length > 0) && (
              <section id="recommended-for-you" className="scroll-mt-36 mb-16">
                <div className="mb-8 text-center md:text-left">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-black font-sans mb-1">
                    picked for you
                  </p>
                  <h2 className="text-3xl md:text-5xl font-serif italic tracking-tight text-black">
                    Recommended
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                  {recommendedItems.map(item => {
                    const isVeg = isVegetarian(item);
                    return (
                      <div
                        key={`rec-${item.id}`}
                        className="flex flex-col pb-4 border-b border-black/10 group"
                      >
                        {/* Top Row: Name and Price/Add */}
                        <div className="flex items-baseline justify-between mb-2">
                          <h3 className="text-xl md:text-2xl font-serif text-[#1A1A1A] leading-tight tracking-tight">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-4 shrink-0 pl-4">
                            <span className="text-lg font-medium font-sans text-[#1A1A1A]">
                              ₹{item.price}
                            </span>
                            <button
                              onClick={() => {
                                onAddToCart(item);
                                setToastMessage(`${item.name} added to cart`);
                                if (toastTimeoutRef.current) {
                                  window.clearTimeout(toastTimeoutRef.current);
                                }
                                toastTimeoutRef.current = window.setTimeout(() => {
                                  setToastMessage(null);
                                }, 1500);
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded-full border border-[#B5693E] text-[#B5693E] 
                                         hover:bg-[#B5693E] hover:text-white transition-all duration-300"
                              aria-label="Add to cart"
                            >
                              <span className="text-lg leading-none mb-0.5">+</span>
                            </button>
                          </div>
                        </div>

                        {/* Bottom Row: Icon + Description */}
                        <div className="flex items-start text-sm text-zinc-500 font-sans font-light leading-relaxed">
                          <span className="inline-flex shrink-0 translate-y-[3px] mr-2">
                            {isVeg ? <VegIcon /> : <NonVegIcon />}
                          </span>
                          <p>
                            {item.notes} • Based on your taste
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Trending Now Section */}
            {trendingItems.length >= 3 && (
              <section
                id="trending-now"
                className="scroll-mt-36"
              >
                <div className="mb-8 text-center md:text-left">
                  <h2 className="text-3xl md:text-5xl font-serif italic tracking-tight">
                    Trending Now
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                  {trendingItems.map(item => {
                    // Find the category group for this item
                    if (!item.category || !item.name || !item.id || item.price == null) return null; // Skip items without required fields
                    const categoryStr = (item.category ?? '').trim();
                    if (!categoryStr) return null; // Skip if category is empty after trimming
                    const canonicalCategory = categoryStr.toUpperCase();
                    const group = (canonicalCategory.split('(')[0] ?? '').trim();

                    const cartItem: CoffeeItem = {
                      id: item.id,
                      name: item.name,
                      notes: group,
                      caffeine: item.caffeine || 'High',
                      intensity: 4,
                      image: item.image || '/media/menu-placeholder.jpg',
                      price: item.price,
                      description: item.description || item.category || item.name,
                    };

                    const isVeg = isVegetarian(item);

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col pb-4 border-b border-black/10 group"
                      >
                        {/* Top Row: Name and Price/Add */}
                        <div className="flex items-baseline justify-between mb-2">
                          <h3 className="text-xl md:text-2xl font-serif text-[#1A1A1A] leading-tight tracking-tight">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-4 shrink-0 pl-4">
                            <span className="text-lg font-medium font-sans text-[#1A1A1A]">
                              ₹{item.price}
                            </span>
                            <button
                              onClick={() => {
                                onAddToCart(cartItem);
                                setToastMessage(`${item.name} added to cart`);
                                if (toastTimeoutRef.current) {
                                  window.clearTimeout(toastTimeoutRef.current);
                                }
                                toastTimeoutRef.current = window.setTimeout(() => {
                                  setToastMessage(null);
                                }, 1500);
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded-full border border-[#B5693E] text-[#B5693E] 
                                         hover:bg-[#B5693E] hover:text-white transition-all duration-300"
                              aria-label="Add to cart"
                            >
                              <span className="text-lg leading-none mb-0.5">+</span>
                            </button>
                          </div>
                        </div>

                        {/* Bottom Row: Icon + Description */}
                        <div className="flex items-start text-sm text-zinc-500 font-sans font-light leading-relaxed">
                          <span className="inline-flex shrink-0 translate-y-[3px] mr-2">
                            {isVeg ? <VegIcon /> : <NonVegIcon />}
                          </span>
                          <p>
                            {item.description || item.category || 'Popular choice'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
            {filteredCategories.map(category => (
              <section
                key={category.id}
                id={category.id}
                data-category-id={category.id}
                className="scroll-mt-36"
              >
                <div className="mb-6 mt-4 text-center md:text-left">
                  <h2 className="text-3xl md:text-5xl font-serif italic tracking-tight">
                    {category.label}
                  </h2>
                </div>

                <div className="space-y-16">
                  {category.subCategories.length > 0 ? (
                    category.subCategories.map(subCategory => (
                      <div key={subCategory.id}>
                        <h3 className="text-xl md:text-2xl font-serif italic text-black/70 mb-8 border-b border-black/5 pb-2 inline-block pr-8">
                          {subCategory.title}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                          {subCategory.items.map(item => {
                            const fullItem = menuItems.find(m => m.id === item.id) || item as any;
                            const description = fullItem.description || fullItem.category || '';
                            const isVeg = isVegetarian(fullItem);

                            return (
                              <div
                                key={item.id}
                                className="flex flex-col pb-4 border-b border-black/10 group"
                              >
                                {/* Top Row: Name and Price/Add */}
                                <div className="flex items-baseline justify-between mb-2">
                                  <h3 className="text-xl md:text-2xl font-serif text-[#1A1A1A] leading-tight tracking-tight">
                                    {item.name}
                                  </h3>
                                  <div className="flex items-center gap-4 shrink-0 pl-4">
                                    <span className="text-lg font-medium font-sans text-[#1A1A1A]">
                                      ₹{item.price}
                                    </span>
                                    <button
                                      onClick={() => handleAddToCart(category, item)}
                                      className="w-6 h-6 flex items-center justify-center rounded-full border border-[#B5693E] text-[#B5693E] 
                                                  hover:bg-[#B5693E] hover:text-white transition-all duration-300"
                                      aria-label="Add to cart"
                                    >
                                      <span className="text-lg leading-none mb-0.5">+</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Bottom Row: Icon + Description */}
                                <div className="flex items-start text-sm text-zinc-500 font-sans font-light leading-relaxed">
                                  <span className="inline-flex shrink-0 translate-y-[3px] mr-2">
                                    {isVeg ? <VegIcon /> : <NonVegIcon />}
                                  </span>
                                  <p>
                                    {description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    // Fallback for items without valid sub-categories or if logic fails
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                      {category.items.map(item => {
                        const fullItem = menuItems.find(m => m.id === item.id) || item as any;
                        const description = fullItem.description || fullItem.category || '';
                        const isVeg = isVegetarian(fullItem);

                        return (
                          <div
                            key={item.id}
                            className="flex flex-col pb-4 border-b border-black/10 group"
                          >
                            <div className="flex items-baseline justify-between mb-2">
                              <h3 className="text-xl md:text-2xl font-serif text-[#1A1A1A] leading-tight tracking-tight">
                                {item.name}
                              </h3>
                              <div className="flex items-center gap-4 shrink-0 pl-4">
                                <span className="text-lg font-medium font-sans text-[#1A1A1A]">
                                  ₹{item.price}
                                </span>
                                <button
                                  onClick={() => handleAddToCart(category, item)}
                                  className="w-6 h-6 flex items-center justify-center rounded-full border border-[#B5693E] text-[#B5693E] 
                                              hover:bg-[#B5693E] hover:text-white transition-all duration-300"
                                  aria-label="Add to cart"
                                >
                                  <span className="text-lg leading-none mb-0.5">+</span>
                                </button>
                              </div>
                            </div>
                            <div className="flex items-start text-sm text-zinc-500 font-sans font-light leading-relaxed">
                              <span className="inline-flex shrink-0 translate-y-[3px] mr-2">
                                {isVeg ? <VegIcon /> : <NonVegIcon />}
                              </span>
                              <p>{description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </main>
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
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="relative z-[10000] w-full max-w-lg"
                >
                  <BrewDeskPopup onClose={() => setShowBrewDesk(false)} onAddToCart={onAddToCart} />
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )
      }

      <Toast message={toastMessage} />
    </div >
  );
};


export default MenuPage;
