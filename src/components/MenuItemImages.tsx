
// Mapping of menu item names/categories to high-quality Unsplash image URLs
// Using generic but premium-looking coffee/food photography

export const ITEM_IMAGES: Record<string, string> = {
    // --- COFFEE (Cold) ---
    'Iced Americano': 'https://images.unsplash.com/photo-1517701604599-bb29b5c7fa69?auto=format&fit=crop&q=80&w=800',
    'Iced Espresso': 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&q=80&w=800',
    'Iced Espresso (Tonic / Ginger Ale / Orange)': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800',
    'Iced Espresso (Red Bull)': 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=800',
    'Cranberry Tonic': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800', // Reusing tonic-like image

    'Iced Latte': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=800',
    'Affogato': 'https://images.unsplash.com/photo-1598346762291-aee88549193f?auto=format&fit=crop&q=80&w=800',
    'Classic Frappe': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=800',
    'Hazelnut': 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?auto=format&fit=crop&q=80&w=800',
    'Caramel': 'https://images.unsplash.com/photo-1627993078864-777dd1f63d08?auto=format&fit=crop&q=80&w=800',
    'Mocha': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=800',
    'Biscoff': 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?auto=format&fit=crop&q=80&w=800',
    'Vietnamese': 'https://images.unsplash.com/photo-1582196016295-e8be296033a9?auto=format&fit=crop&q=80&w=800',
    'Cafe Suda': 'https://images.unsplash.com/photo-1582196016295-e8be296033a9?auto=format&fit=crop&q=80&w=800',
    'Robco': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800',

    // --- COFFEE (Hot) ---
    'Hot Americano': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800',
    'Hot Espresso': 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80&w=800',
    'Hot Latte': 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800', // Latte art
    'Hot Flat White': 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&q=80&w=800',
    'Hot Cappuccino': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=800',
    'Robusta Mocha': 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&q=80&w=800',

    // --- MANUAL BREW ---
    'Classic Cold Brew': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800',
    'Cold Brew (Tonic / Ginger Ale / Orange)': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800',
    'V60 Pour Over (Hot)': 'https://images.unsplash.com/photo-1544986581-efac024db382?auto=format&fit=crop&q=80&w=800', // Pour over specific
    'V60 Pour Over (Cold)': 'https://images.unsplash.com/photo-1544986581-efac024db382?auto=format&fit=crop&q=80&w=800',

    // --- SHAKES ---
    'Chocolate': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800',
    'Biscoff Shake': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800', // Reusing shake
    'Nutella': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800',

    // --- TEA ---
    'Lemon Ice Tea': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800',
    'Peach Ice Tea': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800',
    'Ginger Fizz': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800',
    'Classic Orange Mint': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800',

    // --- FOOD ---
    'Fries': 'https://images.unsplash.com/photo-1518013431117-e5952c7751a0?auto=format&fit=crop&q=80&w=800',
    'Potato Wedges': 'https://images.unsplash.com/photo-1623238905389-1384879fa155?auto=format&fit=crop&q=80&w=800',
    'Veg Nuggets': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=800',
    'Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800',
    'Bagel': 'https://images.unsplash.com/photo-1585478684894-a9291319d154?auto=format&fit=crop&q=80&w=800',
    'Cream Cheese Bagel': 'https://images.unsplash.com/photo-1585478684894-a9291319d154?auto=format&fit=crop&q=80&w=800',
    'Jalapeno Cheese Bagel': 'https://images.unsplash.com/photo-1585478684894-a9291319d154?auto=format&fit=crop&q=80&w=800',
    'Pesto Bagel': 'https://images.unsplash.com/photo-1585478684894-a9291319d154?auto=format&fit=crop&q=80&w=800',
    'Butter Croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800',
    'Nutella Croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800',
    'Cream Cheese Croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800',
};

export const getMenuImage = (itemName: string): string => {
    // 1. Direct match
    if (ITEM_IMAGES[itemName]) return ITEM_IMAGES[itemName];

    // 2. Partial match check (e.g. "Iced Americano" matches "Robusta Iced Americano")
    const entries = Object.entries(ITEM_IMAGES);
    for (const [key, url] of entries) {
        if (itemName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(itemName.toLowerCase())) {
            return url;
        }
    }

    // 3. Fallback based on keywords
    const lower = itemName.toLowerCase();
    if (lower.includes('coffee') || lower.includes('espresso') || lower.includes('latte')) {
        return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800';
    }
    if (lower.includes('tea')) {
        return 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800';
    }
    if (lower.includes('cake') || lower.includes('dessert') || lower.includes('croissant')) {
        return 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800';
    }
    if (lower.includes('food') || lower.includes('pizza') || lower.includes('fry')) {
        return 'https://images.unsplash.com/photo-1518013431117-e5952c7751a0?auto=format&fit=crop&q=80&w=800';
    }

    // Default fallback
    return 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800';
};
