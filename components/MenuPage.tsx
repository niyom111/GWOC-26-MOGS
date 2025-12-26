
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { motion as motionBase } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { CoffeeItem } from '../types';
import { useMenuContext } from '../context/MenuContext';

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

const MenuPage: React.FC<MenuPageProps> = ({ onAddToCart }) => {
  const { menuItems } = useMenuContext();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Set initial active category once we have data
  useEffect(() => {
    if (!activeCategoryId && menuItems.length) {
      const firstCategory = menuItems[0].category.trim().toUpperCase();
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

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    // Build categories from live menu items (deduped by trimmed, uppercased category)
    const categoryMap = new Map<string, MenuCategory>();

    menuItems.forEach(item => {
      const canonicalCategory = item.category.trim().toUpperCase();
      const id = canonicalCategory
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const group = canonicalCategory.split('(')[0].trim();

      if (!categoryMap.has(canonicalCategory)) {
        categoryMap.set(canonicalCategory, {
          id,
          label: canonicalCategory,
          group,
          items: [],
        });
      }

      if (!query || item.name.toLowerCase().includes(query)) {
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
    <div className="bg-[#F9F8F4] text-[#0a0a0a] pt-32 pb-40 px-6 md:px-10 min-h-screen">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-20">
        {/* Sidebar */}
        <aside className="md:col-span-3 mb-8 md:mb-0">
          <div className="sticky top-28 space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.5em] text-zinc-500 mb-3 font-sans">
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
                  className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                    activeCategoryId === cat.id
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

        {/* Right Content */}
        <main className="md:col-span-8">
          {/* Top bar: search + sort (non-sticky) */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative w-full md:max-w-md">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search menu..."
                  className="w-full pl-9 pr-3 py-2 bg-transparent border-b border-black/20 text-sm font-sans outline-none focus:border-black"
                />
              </div>

              <div className="flex items-center gap-2 text-sm font-sans">
                <Filter className="w-4 h-4 text-zinc-500" />
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
            </div>
          </div>

          {/* Sections list */}
          <div className="space-y-10">
            {filteredCategories.map(category => (
              <section
                key={category.id}
                id={category.id}
                data-category-id={category.id}
                className="scroll-mt-28"
              >
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-sans mb-1">
                    {category.group}
                  </p>
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
                          className="px-4 py-2 text-[10px] uppercase tracking-[0.3em] font-sans border border-black/40 rounded-full hover:bg-[#0a0a0a] hover:text-[#F9F8F4] transition-colors"
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

      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 bg-[#0a0a0a] text-[#F9F8F4] px-4 py-2 rounded-full text-xs uppercase tracking-[0.25em] shadow-lg"
        >
          {toastMessage}
        </motion.div>
      )}
    </div>
  );
};

export default MenuPage;
