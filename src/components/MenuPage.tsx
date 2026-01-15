
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

interface MenuCategory {
  id: string;
  label: string;
  group: string; // e.g., Robusta Specialty, Blend, etc.
  items: MenuItem[];
}

// NOTE: static MENU_CATEGORIES kept only as reference; live data now comes from MenuContext.
const MENU_CATEGORIES: MenuCategory[] = [
  {
    id: 'robusta-cold-non-milk',
    label: 'Robusta Specialty (Cold - Non Milk)',
    group: 'Robusta Specialty',
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
    ],
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

  // Set initial active category once we have data
  // Set initial active category once we have data
  useEffect(() => {
    if (!activeCategoryId && menuItems.length) {
      const firstItem = menuItems[0];
      const categorySource = firstItem.category || firstItem.category_name;
      if (!categorySource) return;

      const firstCategory = (categorySource ?? '').trim().toUpperCase();
      if (!firstCategory) return; // Skip if empty after trimming
      const id = firstCategory
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setActiveCategoryId(id);
    }
  }, [activeCategoryId, menuItems]);

  const handleCategoryClick = (id: string) => {
    setActiveCategoryId(id);

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

    // Check if any query word matches any text word
    for (const queryWord of queryWords) {
      if (queryWord.length < 3) continue; // Skip very short words

      for (const textWord of textWords) {
        // Exact match in word
        if (textWord.includes(queryWord)) return true;

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
            return true;
          }
        }

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
          if (matchRatio >= 0.8) return true;
        }
      }
    }

    return false;
  };

  const filteredCategories = useMemo(() => {
    const query = (search || '').trim().toLowerCase();

    // Build categories from live menu items (deduped by trimmed, uppercased category)
    const categoryMap = new Map<string, MenuCategory>();

    menuItems.forEach(item => {
      // Compatibility: use category (legacy) or category_name (new)
      const categorySource = item.category || item.category_name;

      // Skip items without required fields
      if (!categorySource || !item.name || item.price == null || !item.id) return;

      // Use safe defaults
      const categoryStr = (categorySource ?? '').trim();
      if (!categoryStr) return;

      const canonicalCategory = categoryStr.toUpperCase();
      const id = canonicalCategory
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Attempt to derive group from sub_category_name first, fallback to regex on category string
      const groupSource = item.sub_category_name || categorySource;
      const group = (groupSource.split('(')[0] ?? '').trim();

      if (!categoryMap.has(canonicalCategory)) {
        categoryMap.set(canonicalCategory, {
          id,
          label: canonicalCategory,
          group,
          items: [],
        });
      }

      // If no search query, include all items
      if (!query) {
        categoryMap.get(canonicalCategory)!.items.push({
          id: item.id,
          name: item.name,
          price: item.price,
        });
        return;
      }

      // Search in multiple fields:
      // 1. Item name
      const nameStr = (item.name ?? '').toLowerCase();
      const nameMatches = fuzzyMatch(nameStr, query);

      // 2. Category name (so "coffee" finds items even if it's just a category heading)
      const categoryMatches = fuzzyMatch(categoryStr.toLowerCase(), query);

      // 3. Group name (e.g., "Robusta Specialty", "Blend")
      const groupMatches = fuzzyMatch(group.toLowerCase(), query);

      // Include item if any field matches
      if (nameMatches || categoryMatches || groupMatches) {
        categoryMap.get(canonicalCategory)!.items.push({
          id: item.id,
          name: item.name,
          price: item.price,
        });
      }
    });

    let categories = Array.from(categoryMap.values());

    if (sortBy === 'price-asc' || sortBy === 'price-desc') {
      categories = categories.map(category => {
        const sortedItems = [...category.items].sort((a, b) =>
          sortBy === 'price-asc' ? a.price - b.price : b.price - a.price
        );
        return { ...category, items: sortedItems };
      });
    }

    return categories.filter(category => category.items.length > 0);
  }, [menuItems, search, sortBy]);

  // Scroll spy: update active category based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!filteredCategories.length) return;

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const thresholdTop = 0;
      const thresholdBottom = 300; // px from top where we consider a section "active"

      let bestId: string | null = null;
      let bestDistance = Infinity;

      // Pass 1: sections whose top is between 0 and 300px
      filteredCategories.forEach(cat => {
        const el = document.getElementById(cat.id);
        if (!el) return;
        const rect = el.getBoundingClientRect();

        // Consider sections that are at least partially in view
        if (rect.bottom <= 0 || rect.top >= viewportHeight) return;

        // Focus on sections whose top lies in [0, 300px]
        if (rect.top >= thresholdTop && rect.top <= thresholdBottom) {
          const distance = Math.abs(rect.top - thresholdTop);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestId = cat.id;
          }
        }
      });

      // If nothing matched the [0,300] band (e.g. near very top or mid scroll),
      // fall back to the section whose top is closest to the viewport top.
      if (!bestId) {
        filteredCategories.forEach(cat => {
          const el = document.getElementById(cat.id);
          if (!el) return;
          const rect = el.getBoundingClientRect();
          if (rect.bottom <= 0 || rect.top >= viewportHeight) return;
          const distance = Math.abs(rect.top - thresholdTop);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestId = cat.id;
          }
        });
      }

      // If user is at (or very near) the bottom, force last category as active
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight;
      const bottom = scrollTop + viewportHeight;
      if (docHeight - bottom < 40 && filteredCategories.length > 0) {
        bestId = filteredCategories[filteredCategories.length - 1].id;
      }

      if (bestId && bestId !== activeCategoryId) {
        setActiveCategoryId(bestId);
      }
    };

    // Initial run
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [filteredCategories, activeCategoryId]);

  return (
    <div className="bg-[#F3EFE0] text-[#0a0a0a] pt-24 md:pt-32 pb-40 px-6 md:px-10 min-h-screen">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-20">
        {/* Sidebar (Desktop Only) */}
        <aside className="hidden md:block md:col-span-3">
          <div className="sticky top-28 space-y-6">
            <div>
              <p className="text-[13px] uppercase tracking-[0.5em] text-black mb-3 font-sans">
                Rabuste Menu
              </p>
              <h1 className="text-3xl md:text-4xl font-serif italic tracking-tight">
                The Menu Standard.
              </h1>
            </div>

            <nav className="space-y-2 text-xs md:text-sm font-sans uppercase tracking-[0.25em]">
              {filteredCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${activeCategoryId === cat.id
                    ? 'bg-[#0a0a0a] text-[#F9F8F4] font-semibold'
                    : 'text-zinc-600 hover:text-[#0a0a0a] hover:bg-black/5'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile Navigation (Sticky Top) */}
        <div className="md:hidden sticky top-16 z-30 bg-[#F3EFE0]/95 backdrop-blur-sm py-4 -mx-6 px-6 border-b border-black/5 mb-4">
          <p className="text-[9px] uppercase tracking-[0.4em] text-zinc-500 mb-2 font-sans">Menu Categories</p>
          <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar snap-x">
            {filteredCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] font-sans border transition-colors snap-start ${activeCategoryId === cat.id
                  ? 'bg-[#0a0a0a] text-[#F9F8F4] border-[#0a0a0a]'
                  : 'bg-white border-black/10 text-zinc-600'
                  }`}
              >
                {cat.group}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content */}
        <main className="md:col-span-8">
          {/* Top bar: search + sort (non-sticky) */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative w-[85%] md:w-full md:max-w-md">
                <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search menu..."
                  className="w-full pl-9 pr-3 py-2 bg-transparent border-b border-black/20 text-sm font-sans outline-none focus:border-black"
                />
              </div>

              <div className="flex flex-row items-center justify-between w-full md:w-auto gap-4 text-sm font-sans md:items-center md:flex-row md:gap-12">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-" />
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="bg-transparent border-b border-black/20 py-2 text-[10px] md:text-xs uppercase tracking-[0.25em] outline-none focus:border-black"
                  >
                    <option value="default">Sort by</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBrewDesk(true)}
                  className="px-4 py-2 rounded-full border border-black/40 text-[10px] uppercase tracking-[0.25em] text-black bg-white hover:bg-black hover:text-white transition-colors whitespace-nowrap"
                >
                  Help me choose
                </button>
              </div>
            </div>
          </div>

          {/* Sections list */}
          <div className="space-y-10">
            {/* Recommended Section (Personalized) */}
            {recommendedItems.length > 0 && (
              <section id="recommended-for-you" className="scroll-mt-28 mb-10">
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-sans mb-1">
                    picked for you
                  </p>
                  <h2 className="text-3xl md:text-4xl font-serif italic tracking-tight text-[#0a0a0a]">
                    Recommended
                  </h2>
                </div>
                <div>
                  {recommendedItems.map(item => (
                    <div
                      key={`rec-${item.id}`}
                      className="flex items-center justify-between gap-4 py-3 border-b border-black/10 hover:bg-black/5 transition-all duration-200"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-[15px] font-serif">
                          {item.name}
                        </span>
                        <p className="text-[11px] text-zinc-500 mt-0.5 font-sans">
                          {item.notes} • Based on your taste
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold font-sans">
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
                          className="px-4 py-2 text-[10px] uppercase tracking-[0.3em] font-sans border border-black/40 bg-white rounded-full hover:bg-[#0a0a0a] hover:text-[#F9F8F4] transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Trending Now Section */}
            {trendingItems.length >= 3 && (
              <section
                id="trending-now"
                className="scroll-mt-28"
              >
                <div className="mb-4">
                  <h2 className="text-3xl md:text-4xl font-serif italic tracking-tight">
                    Trending Now
                  </h2>
                </div>

                <div>
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

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 py-3 border-b border-black/10 hover:bg-black/5 transition-all duration-200 hover:opacity-90"
                      >
                        <div className="flex-1">
                          <span className="font-medium text-[15px] font-serif">
                            {item.name}
                          </span>
                          <p className="text-[11px] text-zinc-500 mt-0.5 font-sans">
                            Popular in the last 72 hours
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-sm font-semibold font-sans">
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
                            className="px-4 py-2 text-[10px] uppercase tracking-[0.3em] font-sans border border-black/40 rounded-full hover:bg-[#0a0a0a] hover:text-[#F9F8F4] transition-colors"
                          >
                            Add to Cart
                          </button>
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
                className="scroll-mt-28"
              >
                <div className="mb-4">
                  <h2 className="text-3xl md:text-4xl font-serif italic tracking-tight">
                    {category.label}
                  </h2>
                </div>

                <div>
                  {category.items.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 py-3 border-b border-black/10 hover:bg-black/5 transition-colors"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-[15px] font-serif">
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold font-sans">
                          ₹{item.price}
                        </span>
                        <button
                          onClick={() => handleAddToCart(category, item)}
                          className="px-4 py-2 text-[10px] uppercase tracking-[0.3em] font-sans border border-black/40 rounded-full bg-white hover:bg-[#0a0a0a] hover:text-[#F9F8F4] transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>

      {typeof document !== 'undefined' && createPortal(
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
      )}

      <Toast message={toastMessage} />
    </div>
  );
};


export default MenuPage;
