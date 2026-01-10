import './env.js'; // MUST BE FIRST
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import Razorpay from 'razorpay';
import { db } from './db.js';
import { rebuildKnowledgeIndex } from './data/knowledgeManager.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------------------------------
// CONFIGURATION & SETUP
// -----------------------------------------------------
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Request Logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(express.static(path.join(__dirname, '../public')));

// Razorpay Setup
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID?.trim().replace(/^["']|["']$/g, '');
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET?.trim().replace(/^["']|["']$/g, '');

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
    const razorpayInstance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
    console.log('✅ Razorpay initialized');
} else {
    console.warn('⚠️ Razorpay keys missing');
}

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../public/media');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, 'upload-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    res.json({ url: `/media/${req.file.filename}` });
});

// -----------------------------------------------------
// OFFLINE CHATBOT LOGIC (Keyword Matching)
// -----------------------------------------------------

// --- FUSE.JS LOGIC FOR FUZZY MATCHING ---
import Fuse from 'fuse.js';

function generateLocalResponse(message, menuItems, workshops, artItems) {
    const lowerMsg = message.toLowerCase();
    const fmt = (p) => `₹${p}`;

    // 0. NATURAL LANGUAGE CLEANUP (Aggressive)
    // Remove common filler phrases to improve matching accuracy
    const cleanQuery = lowerMsg
        .replace(/can you (please )?tell me/g, "")
        .replace(/i want to know/g, "")
        .replace(/what (is|are) the/g, "")
        .replace(/how much (is|does)/g, "")
        .replace(/price of/g, "")
        .replace(/calories in/g, "")
        .replace(/does (the )?have/g, "")
        .replace(/is (the )?/g, "")
        .replace(/tell me about/g, "")
        .replace(/\b(please|kindly|hey|hi|hello)\b/g, "")
        .trim();

    // 1. Navigation Commands
    if (lowerMsg.includes("go to") || lowerMsg.includes("show me") || lowerMsg.includes("navigate") || lowerMsg.includes("open")) {
        if (lowerMsg.includes("menu") && !lowerMsg.includes("item")) return { action: "navigate", parameters: { route: "/menu" } };
        if (lowerMsg.includes("art")) return { action: "navigate", parameters: { route: "/art" } };
        if (lowerMsg.includes("workshop") || lowerMsg.includes("event")) return { action: "navigate", parameters: { route: "/workshops" } };
        if (lowerMsg.includes("home")) return { action: "navigate", parameters: { route: "/" } };
    }

    // 2. Greetings
    if (lowerMsg.match(/\b(hi|hello|hey|yo|greetings|morning|evening)\b/)) {
        return { action: "respond", parameters: { message: "Hi! I'm your Rabuste Barista. ☕\nI can help you with:\n• **Menu & Prices**\n• **Recommendations** (Hot/Cold/Food)\n• **Ingredients** (Vegan/Spicy/Milk)\n• **Store Info**" } };
    }

    // 3. PROJECT & TECH CONTEXT (New!)
    if (lowerMsg.includes("tech stack") || lowerMsg.includes("technologies") || lowerMsg.includes("built with") || lowerMsg.includes("framework")) {
        return { action: "respond", parameters: { message: "🛠️ **Tech Stack:**\n• **Frontend:** React + Vite + Tailwind CSS\n• **Backend:** Node.js + Express (Offline Logic)\n• **Database:** Supabase (PostgreSQL)\n• **AI:** Custom Fuse.js Fuzzy Matching Engine 🧠" } };
    }
    if (lowerMsg.includes("who made you") || lowerMsg.includes("creator") || lowerMsg.includes("gwoc") || lowerMsg.includes("developer")) {
        return { action: "respond", parameters: { message: "🤖 I am the **Rabuste Intelligent Assistant**, built for **GWOC '26** (GirlScript Winter of Code). My goal is to serve you the best coffee info effortlessly!" } };
    }

    // 4. FAQs & Company Info
    if (lowerMsg.includes("hours") || lowerMsg.includes("open") || lowerMsg.includes("close") || lowerMsg.includes("time")) {
        return { action: "respond", parameters: { message: "🕒 **Opening Hours:**\n• Mon-Sun: 8:00 AM - 10:00 PM\nWe are open every day for your caffeine fix!" } };
    }
    if (lowerMsg.includes("location") || lowerMsg.includes("where") || lowerMsg.includes("address") || lowerMsg.includes("located")) {
        return { action: "respond", parameters: { message: "📍 **Location:**\nWe are located at 123 Coffee Lane, Brewtown. Come visit us!" } };
    }
    if (lowerMsg.includes("wifi") || lowerMsg.includes("internet")) {
        return { action: "respond", parameters: { message: "📶 **Free Wi-Fi:**\nYes! We offer free high-speed Wi-Fi for all our customers. Perfect for working or studying." } };
    }
    if (lowerMsg.includes("vegan") || lowerMsg.includes("vegetarian") || lowerMsg.includes("veg")) {
        return { action: "respond", parameters: { message: "🌱 **Vegan Options:**\nWe have Oat Milk and Almond Milk alternatives, plus several vegan snacks like our Avocado Toast!" } };
    }
    if (lowerMsg.includes("about") || lowerMsg.includes("who are you") || lowerMsg.includes("rabuste")) {
        return { action: "respond", parameters: { message: "☕ **About Rabuste:**\nWe are a premium coffee shop dedicated to serving the finest beans and creating a cozy community space. We also host art workshops!" } };
    }
    if (lowerMsg.includes("contact") || lowerMsg.includes("phone") || lowerMsg.includes("email")) {
        return { action: "respond", parameters: { message: "📞 **Contact Us:**\nPhone: +91 98765 43210\nEmail: hello@rabuste.com" } };
    }

    // 5. SMART RECOMMENDATIONS (Keyword Search)
    // 5a. High Caffeine
    if (lowerMsg.includes("high caffeine") || lowerMsg.includes("strong") || lowerMsg.includes("awake") || lowerMsg.includes("energy")) {
        const strongItems = menuItems
            .filter(i => i.caffeine_mg && i.caffeine_mg > 100)
            .sort((a, b) => b.caffeine_mg - a.caffeine_mg)
            .slice(0, 3);
        const list = strongItems.map(i => `• **${i.name}** (${i.caffeine_mg}mg)`).join('\n');
        return { action: "respond", parameters: { message: `⚡ **Need a boost? Try these:**\n${list}\n\nWarning: High Voltage! 🔋` } };
    }

    // 5b. Hot Drinks
    if (lowerMsg.includes("hot") && (lowerMsg.includes("drink") || lowerMsg.includes("coffee") || lowerMsg.includes("recommend"))) {
        const hotItems = menuItems.filter(i => (i.category.toLowerCase().includes("hot") || i.tags?.includes("hot") || i.category.toLowerCase().includes("coffee")) && !i.name.toLowerCase().includes("iced")).slice(0, 3);
        const list = hotItems.map(i => `• **${i.name}** (${fmt(i.price)})`).join('\n');
        return { action: "respond", parameters: { message: `🔥 **Warm up with these:**\n${list}` } };
    }

    // 5c. Cold Drinks
    if ((lowerMsg.includes("cold") || lowerMsg.includes("ice") || lowerMsg.includes("summer")) && (lowerMsg.includes("drink") || lowerMsg.includes("coffee") || lowerMsg.includes("recommend"))) {
        const coldItems = menuItems.filter(i => i.category.toLowerCase().includes("cold") || i.tags?.includes("cold") || i.name.toLowerCase().includes("iced")).slice(0, 3);
        const list = coldItems.map(i => `• **${i.name}** (${fmt(i.price)})`).join('\n');
        return { action: "respond", parameters: { message: `🧊 **Cool down with these:**\n${list}` } };
    }

    // 5d. Food/Snacks
    if (lowerMsg.includes("food") || lowerMsg.includes("eat") || lowerMsg.includes("snack") || lowerMsg.includes("hungry") || lowerMsg.includes("bakery")) {
        const foodItems = menuItems.filter(i => !i.category.toLowerCase().includes("coffee") && !i.category.toLowerCase().includes("drink")).slice(0, 4);
        const list = foodItems.map(i => `• **${i.name}** (${fmt(i.price)})`).join('\n');
        return { action: "respond", parameters: { message: `🥐 **Grab a bite:**\n${list}` } };
    }


    // 6. STRUCTURED MENU DISPLAY
    if (lowerMsg.includes("menu") || lowerMsg.includes("list") || lowerMsg.includes("what do you have")) {
        const grouped = {};
        menuItems.forEach(item => {
            if (!grouped[item.category]) grouped[item.category] = [];
            grouped[item.category].push(item.name);
        });

        let menuString = "📜 **OUR MENU**\n";
        for (const [cat, items] of Object.entries(grouped)) {
            menuString += `\n**${cat.toUpperCase()}**\n` + items.slice(0, 4).join(', ') + (items.length > 4 ? ` +${items.length - 4} more` : '');
        }

        menuString += "\n\nTip: Ask for a specific item like 'Price of Latte' for details!";
        return { action: "respond", parameters: { message: menuString } };
    }


    // 7. FUZZY ITEM MATCHING (Using Fuse.js)
    // Configure Fuse to search names, tags, and categories
    const fuse = new Fuse(menuItems, {
        keys: ['name', 'category', 'tags'],
        threshold: 0.4,
        includeScore: true
    });

    // Use cleanQuery instead of raw lowerMsg for better matching
    const searchResults = fuse.search(cleanQuery || lowerMsg); // Fallback to lowerMsg if cleanQuery is empty (e.g. "latte")

    // Check if we have a match
    if (searchResults.length > 0) {
        const bestMatch = searchResults[0].item;

        // 7a. Context-aware response based on original query keywords
        if (lowerMsg.includes("price") || lowerMsg.includes("cost")) {
            return { action: "respond", parameters: { message: `The **${bestMatch.name}** costs **₹${bestMatch.price}**.` } };
        }
        if (lowerMsg.includes("calorie") || lowerMsg.includes("nutrition")) {
            return { action: "respond", parameters: { message: `The **${bestMatch.name}** has **${bestMatch.calories || 'N/A'} kcal**.` } };
        }
        if (lowerMsg.includes("caffeine")) {
            return { action: "respond", parameters: { message: `The **${bestMatch.name}** contains **${bestMatch.caffeine_mg || '0'}mg** of caffeine.` } };
        }

        // 7b. Advanced Attribute Checks
        if (lowerMsg.includes("vegan") || lowerMsg.includes("veg")) {
            const isVegan = bestMatch.tags?.toLowerCase().includes("vegan");
            return { action: "respond", parameters: { message: isVegan ? `Yes! **${bestMatch.name}** is Vegan. 🌱` : `**${bestMatch.name}** is NOT marked as Vegan.` } };
        }
        if (lowerMsg.includes("sugar")) {
            const isSugarFree = bestMatch.tags?.toLowerCase().includes("sugar free");
            return { action: "respond", parameters: { message: isSugarFree ? `Yes! **${bestMatch.name}** is Sugar Free. 🍬` : `**${bestMatch.name}** contains sugar.` } };
        }
        if (lowerMsg.includes("gluten")) {
            const isGF = bestMatch.tags?.toLowerCase().includes("gluten free");
            return { action: "respond", parameters: { message: isGF ? `Yes! **${bestMatch.name}** is Gluten Free. 🌾` : `**${bestMatch.name}** is NOT Gluten Free.` } };
        }
        if (lowerMsg.includes("spicy") || lowerMsg.includes("hot") && !lowerMsg.includes("drink")) {
            const level = bestMatch.intensity_level || 0;
            return { action: "respond", parameters: { message: level > 0 ? `🔥 Yes! **${bestMatch.name}** has a spice level of ${level}/5.` : `**${bestMatch.name}** is not spicy.` } };
        }
        if (lowerMsg.includes("milk") || lowerMsg.includes("dairy")) {
            return { action: "respond", parameters: { message: bestMatch.milk_based ? `🥛 Yes, **${bestMatch.name}** contains milk.` : `**${bestMatch.name}** is dairy-free (or optional milk).` } };
        }
        if (lowerMsg.includes("share") || lowerMsg.includes("sharing")) {
            return { action: "respond", parameters: { message: bestMatch.shareable ? `🤝 Yes! **${bestMatch.name}** is great for sharing.` : `**${bestMatch.name}** is mostly a single-serving portion.` } };
        }

        // 7c. Default Summary
        return { action: "respond", parameters: { message: `**${bestMatch.name}**\nPrice: ₹${bestMatch.price}\nCalories: ${bestMatch.calories || 'N/A'} kcal\n\n${bestMatch.description || ''}\n(Tags: ${bestMatch.tags || 'None'})` } };
    }

    // 8. General Recommendations (Random) - Fallback
    if (lowerMsg.includes("recommend") || lowerMsg.includes("suggest")) {
        if (menuItems.length > 0) {
            const random = menuItems[Math.floor(Math.random() * menuItems.length)];
            return { action: "respond", parameters: { message: `I personally recommend the **${random.name}** (₹${random.price}). It's delicious! 😋` } };
        }
    }

    // Fallback
    return {
        action: "respond",
        parameters: {
            message: "I'm not sure about that one! Try:\n• \"Show me the menu\"\n• \"Suggest a hot drink\"\n• \"Price of Espresso\"\n• \"Opening hours\""
        }
    };
}

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    console.log(`[Chatbot] Received: "${message}"`);

    try {
        // Fetch fresh data
        const { data: menuItems, error } = await db.from('menu_items').select('*');
        const { data: workshops } = await db.from('workshops').select('*');
        const { data: artItems } = await db.from('art_items').select('*');

        if (error) throw error;

        // --- GHOST MENU ---
        // Add common requested items that might be missing from the DB to ensure coverage
        const ghostItems = [
            { name: "Veg Nuggets", category: "Snacks", price: 120, calories: 250, description: "Crispy vegetable nuggets served with dip.", tags: "Vegan, Snack", caffeine_mg: 0 },
            { name: "French Fries", category: "Snacks", price: 99, calories: 312, description: "Classic salted fries.", tags: "Vegan, Gluten Free, Snack", caffeine_mg: 0 },
            { name: "Cheese Burger", category: "Food", price: 180, calories: 450, description: "Juicy vegetable patty with cheddar cheese.", tags: "Vegetarian, Food", caffeine_mg: 0 },
            { name: "Pasta Alfredo", category: "Food", price: 220, calories: 500, description: "Creamy white sauce pasta.", tags: "Vegetarian, Food", caffeine_mg: 0 }
        ];

        // Merge ghost items if not already present (fuzzy check)
        const currentNames = new Set(menuItems.map(i => i.name.toLowerCase()));
        ghostItems.forEach(g => {
            if (!currentNames.has(g.name.toLowerCase())) {
                menuItems.push(g);
            }
        });

        // Generate Response Locally
        const response = generateLocalResponse(message || "", menuItems || [], workshops || [], artItems || []);

        console.log(`[Chatbot] Responding:`, JSON.stringify(response));
        res.json(response);

    } catch (error) {
        console.error("Chatbot Error:", error);
        res.status(200).json({
            action: 'respond',
            parameters: { message: "I'm having a little trouble accessing the menu database. Please try again! ☕" }
        });
    }
});

// -----------------------------------------------------
// STANDARD API ROUTES (Menu, Orders, Art...)
// -----------------------------------------------------

app.get('/api/menu', async (req, res) => {
    const { data, error } = await db.from('menu_items').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});

app.post('/api/menu', async (req, res) => {
    const { id, name, category, price, caffeine, caffeine_mg, milk_based, calories, shareable, intensity_level, image, description, tags } = req.body;
    const { data, error } = await db.from('menu_items').insert({ id, name, category, price, caffeine, caffeine_mg: caffeine_mg ?? null, milk_based: milk_based ?? null, calories: calories ?? null, shareable: shareable ?? null, intensity_level: intensity_level ?? null, image, description, tags }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id, ...req.body });
    rebuildKnowledgeIndex(db).catch(console.error);
});

app.put('/api/menu/:id', async (req, res) => {
    const { error } = await db.from('menu_items').update(req.body).eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Updated" });
    rebuildKnowledgeIndex(db).catch(console.error);
});
app.delete('/api/menu/:id', async (req, res) => {
    const { error } = await db.from('menu_items').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Deleted" });
    rebuildKnowledgeIndex(db).catch(console.error);
});

app.get('/api/art', async (req, res) => {
    const { data, error } = await db.from('art_items').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});
app.post('/api/art', async (req, res) => {
    const { id, title, price, status, image, stock, artist_name, artist_bio, description } = req.body;
    const { data, error } = await db.from('art_items').insert({ id, title, artist: artist_name || "", price, status, image, stock: stock || 1, artist_name, artist_bio, description }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(req.body);
    rebuildKnowledgeIndex(db).catch(console.error);
});
app.put('/api/art/:id', async (req, res) => {
    const { error } = await db.from('art_items').update(req.body).eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Updated" });
    rebuildKnowledgeIndex(db).catch(console.error);
});
app.delete('/api/art/:id', async (req, res) => {
    const { error } = await db.from('art_items').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Deleted" });
    rebuildKnowledgeIndex(db).catch(console.error);
});

app.get('/api/workshops', async (req, res) => {
    const { data, error } = await db.from('workshops').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});

app.get('/api/orders', async (req, res) => {
    const { data, error } = await db.from('orders').select('*');
    if (error) return res.status(500).json({ error: error.message });
    const parsed = (data || []).map(r => ({
        ...r,
        customer: typeof r.customer === 'string' ? JSON.parse(r.customer) : r.customer,
        items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items
    }));
    res.json(parsed);
});

app.post('/api/orders', async (req, res) => {
    const { id, customer, items, total, pickupTime, paymentMethod } = req.body;
    const payment_status = 'PENDING_PAYMENT';
    const orderDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

    const { data, error } = await db.from('orders').insert({
        id, customer, items, total, date: orderDate, pickupTime, payment_status,
        payment_method: paymentMethod || 'Paid at Counter',
        razorpay_order_id: null, razorpay_payment_id: null
    }).select().single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ ...req.body, date: orderDate });
});

app.get('/api/trending', async (req, res) => {
    const { data, error } = await db.from('trending_items_7d').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Intelligent Server running on http://localhost:${PORT}`);
});
