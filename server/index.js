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
const PORT = process.env.PORT || 5000;

// CORS configuration - allow frontend domains
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // Allow localhost for development
        if (origin.startsWith('http://localhost')) return callback(null, true);

        // Allow all Vercel domains
        if (origin.includes('.vercel.app')) return callback(null, true);

        // Allow custom domain if set
        if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
            return callback(null, true);
        }

        callback(null, true); // Allow all origins for now
    },
    credentials: true
}));
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
// Decrement stock for art item (when added to cart)
app.post('/api/art/:id/decrement-stock', async (req, res) => {
    try {
        const artId = req.params.id;
        
        // Get current stock
        const { data: artItem, error: fetchError } = await db
            .from('art_items')
            .select('id, stock, status')
            .eq('id', artId)
            .single();

        if (fetchError || !artItem) {
            return res.status(404).json({ error: 'Art item not found' });
        }

        const currentStock = parseInt(String(artItem.stock)) || 0;
        
        if (currentStock <= 0) {
            return res.status(400).json({ error: 'Item is out of stock' });
        }

        const newStock = currentStock - 1;
        const newStatus = newStock > 0 ? 'Available' : 'Sold';

        // Update stock and status
        const { data: updatedItem, error: updateError } = await db
            .from('art_items')
            .update({ 
                stock: newStock,
                status: newStatus
            })
            .eq('id', artId)
            .select()
            .single();

        if (updateError) {
            return res.status(500).json({ error: updateError.message });
        }

        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Increment stock for art item (when removed from cart)
app.post('/api/art/:id/increment-stock', async (req, res) => {
    try {
        const artId = req.params.id;
        
        // Get current stock
        const { data: artItem, error: fetchError } = await db
            .from('art_items')
            .select('id, stock, status')
            .eq('id', artId)
            .single();

        if (fetchError || !artItem) {
            return res.status(404).json({ error: 'Art item not found' });
        }

        const currentStock = parseInt(String(artItem.stock)) || 0;
        const newStock = currentStock + 1;
        const newStatus = 'Available'; // Always available when stock > 0

        // Update stock and status
        const { data: updatedItem, error: updateError } = await db
            .from('art_items')
            .update({ 
                stock: newStock,
                status: newStatus
            })
            .eq('id', artId)
            .select()
            .single();

        if (updateError) {
            return res.status(500).json({ error: updateError.message });
        }

        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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
    try {
        const { id, customer, items, total, pickupTime, paymentMethod } = req.body;

        // Validation
        if (!id || !customer || !items || total === undefined) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'Required: id, customer, items, total'
            });
        }

        // Validate customer object
        if (!customer.name || !customer.phone || !customer.email) {
            return res.status(400).json({
                error: 'Invalid customer data',
                details: 'Customer must have name, phone, and email'
            });
        }

        // Validate items array
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                error: 'Invalid items data',
                details: 'Items must be a non-empty array'
            });
        }

        // Pay at Counter flow - no Razorpay, direct insert
        // Normalize payment method: 'counter' -> 'Paid at Counter', 'upi' -> 'Paid Online' (though UPI usually goes through verify-payment)
        let normalizedPaymentMethod = 'Paid at Counter';
        if (paymentMethod) {
            if (paymentMethod.toLowerCase() === 'counter') {
                normalizedPaymentMethod = 'Paid at Counter';
            } else if (paymentMethod.toLowerCase() === 'upi') {
                // If this is called for UPI, it's likely a mistake or a direct call.
                // But for now we just log it as Paid Online.
                // Ideally UPI orders go through verify-payment solely.
                normalizedPaymentMethod = 'Paid Online';
            } else {
                normalizedPaymentMethod = paymentMethod;
            }
        }
        const payment_status = 'PENDING_PAYMENT';

        // USE IST TIME
        const orderDate = getISTTime();

        // Insert order with all columns: include payment_status, payment_method, and NULL payment IDs for counter orders
        // Set status to 'placed' by default if not provided
        const orderStatus = req.body.status || 'placed';

        // Supabase/PostgreSQL JSONB fields accept objects directly
        const { data, error } = await db.from('orders').insert({
            id,
            customer: customer, // JSONB - Supabase handles object serialization
            items: items, // JSONB - Supabase handles object serialization
            total,
            date: orderDate,
            pickupTime,
            payment_status,
            payment_method: normalizedPaymentMethod,
            razorpay_order_id: null,
            razorpay_payment_id: null,
            status: orderStatus
        }).select().single();

        if (error) {
            console.error('Order save error:', error);
            return res.status(500).json({
                error: 'Failed to save order',
                details: error.message
            });
        }
        console.log('Order saved successfully:', id, 'at', orderDate);
        res.status(200).json({ ...req.body, date: orderDate, status: orderStatus });
    } catch (error) {
        console.error('Unexpected error in order creation:', error);
        return res.status(500).json({
            error: 'Unexpected server error',
            details: error.message
        });
    }
});

// Get orders by email
app.get('/api/orders/by-email', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ error: 'Email parameter is required' });
        }

        const searchEmail = email.toLowerCase().trim();

        // Fetch all orders and filter by email in JavaScript
        // Supabase returns JSONB fields as objects, so we can filter directly
        const { data, error } = await db
            .from('orders')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching orders by email:', error);
            return res.status(500).json({ error: error.message });
        }

        // Parse JSON fields and filter by email
        const parsed = (data || [])
            .map(r => ({
                ...r,
                customer: typeof r.customer === 'string' ? JSON.parse(r.customer) : r.customer,
                items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items
            }))
            .filter(order => {
                // Check if customer email matches (case-insensitive)
                const customerEmail = order.customer?.email?.toLowerCase().trim();
                return customerEmail === searchEmail;
            });

        res.json(parsed);
    } catch (error) {
        console.error('Unexpected error in orders by email:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get active orders (non-completed)
app.get('/api/orders/active', async (req, res) => {
    try {
        const { data, error } = await db
            .from('orders')
            .select('*')
            .neq('status', 'completed')
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching active orders:', error);
            return res.status(500).json({ error: error.message });
        }

        // Parse JSON fields
        const parsed = (data || []).map(r => ({
            ...r,
            customer: typeof r.customer === 'string' ? JSON.parse(r.customer) : r.customer,
            items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items
        }));

        res.json(parsed);
    } catch (error) {
        console.error('Unexpected error in active orders:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update order status
app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, updated_by } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        // Update order status
        const { data: updatedOrder, error: updateError } = await db
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating order status:', updateError);
            return res.status(500).json({ error: updateError.message });
        }

        // Log status change
        const { error: logError } = await db
            .from('order_status_logs')
            .insert({
                order_id: id,
                status: status,
                updated_by: updated_by || 'employee'
            });

        if (logError) {
            console.error('Error logging status change:', logError);
            // Don't fail the request if logging fails, but log it
        }

        // Parse JSON fields
        const parsed = {
            ...updatedOrder,
            customer: typeof updatedOrder.customer === 'string' ? JSON.parse(updatedOrder.customer) : updatedOrder.customer,
            items: typeof updatedOrder.items === 'string' ? JSON.parse(updatedOrder.items) : updatedOrder.items
        };

        res.json(parsed);
    } catch (error) {
        console.error('Unexpected error in update order status:', error);
        res.status(500).json({ error: error.message });
    }
});
// -----------------------------------------------------
// BREWDESK VIBE-BASED RECOMMENDATIONS (SMART SHUFFLE)
// -----------------------------------------------------
app.post('/api/recommendations/context', async (req, res) => {
    try {
        const { mood, activity } = req.body || {};

        const validMoods = ['Energetic', 'Weak', 'Comfort'];
        const validActivities = ['Work', 'Hangout', 'Chill'];
        if (!validMoods.includes(mood) || !validActivities.includes(activity)) {
            return res.status(400).json({ error: 'Invalid mood or activity' });
        }

        // 1. Fetch Data & Prepare Items
        const { data: menuData, error: menuError } = await db.from('menu_items').select('*');
        if (menuError) throw new Error('Failed to fetch menu');

        // Get trending items with error handling
        const { data: trendingData, error: trendingError } = await db
            .from('trending_items_7d')
            .select('*');

        if (trendingError) {
            console.error('Trending query error (non-fatal):', trendingError);
        }
        const trendingMap = new Map();
        (trendingData || []).forEach(item => trendingMap.set(item.item_id, item.total_quantity || 0));

        const menuItems = (menuData || []).map(m => ({
            ...m,
            trendCount: trendingMap.get(m.id) || 0
        }));

        // -----------------------------------------------------
        // CORE LOGIC (User Provided)
        // -----------------------------------------------------

        // 2. Helper to classify coffee strength based on caffeine
        const classifyStrength = (mg) => {
            if (mg == null) return 'medium'; // Default
            if (mg < 100) return 'light';    // Tea, Single Shot
            if (mg < 115) return 'medium';   // Mild (gap 100-115)
            return 'strong';                 // Americano(120), Double(128), Red Bull(150), Cold Brew(200)
        };

        // 3. Define Scoring Weights

        // COFFEE WEIGHTS
        const moodWeights = {
            Energetic: { light: 2, medium: 1, strong: -2 }, // Keep it light
            Weak: { light: -2, medium: 1, strong: 4 },      // Need power
            Comfort: { light: 1, medium: 3, strong: 0 },    // Warm/Cozy
        };

        const activityCoffeeWeights = {
            Work: { light: 0, medium: 1, strong: 3 },       // Focus booster
            Hangout: { light: 1, medium: 2, strong: 0 },    // Social sipping
            Chill: { light: 3, medium: 1, strong: -1 },     // Relaxing
        };

        // SNACK WEIGHTS
        const activitySnackWeights = {
            Work: { lightSnack: 3, shareable: -1, heavy: -2 },  // Clean eating
            Hangout: { lightSnack: 1, shareable: 4, heavy: 1 }, // Sharing is caring
            Chill: { lightSnack: 1, shareable: 1, heavy: 3 },   // Indulge
        };

        const moodSnackWeights = {
            Energetic: { lightSnack: 2, shareable: 0, heavy: -1 },
            Weak: { lightSnack: -1, shareable: 0, heavy: 3 },   // Sugar/Carb loading
            Comfort: { lightSnack: 0, shareable: 0, heavy: 3 }, // Comfort food
        };

        // 4. Filter Items
        const snacks = menuItems.filter(item =>
            (item.category && item.category.toLowerCase().includes('food')) ||
            (item.category && item.category.toLowerCase().includes('bagel')) ||
            item.name.toLowerCase().includes('croissant')
        );
        const coffees = menuItems.filter(item => !snacks.includes(item));

        let bestCoffee = null;
        let bestSnack = null;

        // --- LOGIC: PROCESS COFFEE ---
        if (coffees.length > 0) {
            const mWeight = moodWeights[mood];
            const aWeight = activityCoffeeWeights[activity];

            const scoredCoffees = coffees.map((item) => {
                const caffeineMg = item.caffeine_mg || 0;
                const strength = classifyStrength(caffeineMg);

                let score = 0;
                score += mWeight[strength] || 0;
                score += aWeight[strength] || 0;

                // Bonus for trending items
                if (item.trendCount > 0) score += 1;

                return { item, score, strength, caffeineMg };
            });

            // Sort: Score DESC, then context-specific tie-breakers
            scoredCoffees.sort((a, b) => {
                let scoreA = a.score;
                let scoreB = b.score;

                // --- ACCURACY BOOSTERS (Specific Overrides) ---

                // 1. "Deep Focus" (Work) + "Drained" (Weak) -> NEEDS RED BULL or MAX CAFFEINE
                if (activity === 'Work' && mood === 'Weak') {
                    if (a.item.name.toLowerCase().includes('red bull')) scoreA += 5;
                    if (b.item.name.toLowerCase().includes('red bull')) scoreB += 5;
                    // Boost pure black coffee too
                    if (a.item.name.toLowerCase().includes('americano') || a.item.name.toLowerCase().includes('espresso')) scoreA += 3;
                    if (b.item.name.toLowerCase().includes('americano') || b.item.name.toLowerCase().includes('espresso')) scoreB += 3;
                }

                // 2. "Deep Focus" (Work) -> Avoid messy drinks (Tonic/Ginger/Ice Cream)
                if (activity === 'Work') {
                    if (a.item.name.toLowerCase().includes('tonic') || a.item.name.toLowerCase().includes('ginger')) scoreA -= 2;
                    if (b.item.name.toLowerCase().includes('tonic') || b.item.name.toLowerCase().includes('ginger')) scoreB -= 2;
                }

                // 3. "Cozy" (Comfort) -> Boost Milk/Chocolate
                if (mood === 'Comfort') {
                    if (a.item.name.toLowerCase().includes('mocha') || a.item.name.toLowerCase().includes('latte')) scoreA += 3;
                    if (b.item.name.toLowerCase().includes('mocha') || b.item.name.toLowerCase().includes('latte')) scoreB += 3;
                }

                if (scoreB !== scoreA) return scoreB - scoreA;

                // Secondary Sort: Caffeine for Weak/Work
                if ((activity === 'Work' || mood === 'Weak') && b.caffeineMg !== a.caffeineMg) {
                    return b.caffeineMg - a.caffeineMg;
                }
                return a.item.price - b.item.price; // Cheaper tie-breaker
            });

            // SMART SHUFFLE: Pick randomly from the "Top Tier"
            const topScore = scoredCoffees[0].score;
            const topTier = scoredCoffees.filter(i => i.score >= topScore - 0.5);
            const safePool = topTier.slice(0, 3); // Top 3 max

            const picked = safePool[Math.floor(Math.random() * safePool.length)];

            if (picked) {
                bestCoffee = picked.item;
                // Preserve metadata for UI
                bestCoffee.strengthLabel = picked.strength;
                bestCoffee.trending = picked.item.trendCount > 0;
            }
        }

        // --- LOGIC: PROCESS SNACKS ---
        if (snacks.length > 0) {
            const aWeight = activitySnackWeights[activity];
            const mWeight = moodSnackWeights[mood];

            const scoredSnacks = snacks.map((item) => {
                const calories = item.calories || 0;
                const shareable = !!item.shareable;

                const isLight = calories <= 250;
                const isHeavy = calories > 350;

                let score = 0;
                // Activity scores
                if (isLight) score += aWeight.lightSnack;
                if (shareable) score += aWeight.shareable;
                if (isHeavy) score += aWeight.heavy;

                // Mood scores
                if (isLight) score += mWeight.lightSnack;
                if (shareable) score += mWeight.shareable;
                if (isHeavy) score += mWeight.heavy;

                if (item.trendCount > 0) score += 1;

                return { item, score };
            });

            scoredSnacks.sort((a, b) => b.score - a.score);

            // SMART SHUFFLE for Snacks
            const topScore = scoredSnacks[0].score;
            const topTier = scoredSnacks.filter(i => i.score >= topScore - 0.5);
            const safePool = topTier.slice(0, 3);

            const picked = safePool[Math.floor(Math.random() * safePool.length)];

            if (picked) {
                bestSnack = picked.item;
                bestSnack.trending = picked.item.trendCount > 0;
            }
        }

        // Construct Response
        res.json({
            coffee: bestCoffee ? {
                id: bestCoffee.id,
                name: bestCoffee.name,
                description: bestCoffee.description,
                price: bestCoffee.price,
                image: bestCoffee.image,
                caffeine_mg: bestCoffee.caffeine_mg,
                calories: bestCoffee.calories,
                tags: [
                    bestCoffee.strengthLabel ? bestCoffee.strengthLabel.charAt(0).toUpperCase() + bestCoffee.strengthLabel.slice(1) : '',
                    bestCoffee.trending ? 'Trending' : ''
                ].filter(Boolean),
                reason: `Matches your ${mood} mood for ${activity}`
            } : null,
            snack: bestSnack ? {
                id: bestSnack.id,
                name: bestSnack.name,
                description: bestSnack.description,
                price: bestSnack.price,
                image: bestSnack.image,
                calories: bestSnack.calories,
                shareable: bestSnack.shareable,
                tags: [bestSnack.shareable ? 'Shareable' : 'Single', bestSnack.trending ? 'Trending' : ''].filter(Boolean)
            } : null
        });

    } catch (error) {
        console.error('Recommendation Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// -----------------------------------------------------
// FRANCHISE MANAGEMENT ENDPOINTS
// -----------------------------------------------------

// 1. SETTINGS (Contact Number)
app.get('/api/franchise/settings', async (req, res) => {
    try {
        const { data, error } = await db.from('franchise_settings').select('*').limit(1).single();
        if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
            return res.status(500).json({ error: error.message });
        }
        // Return default if not found
        res.json(data || { contact_number: '+91 98765 43210' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/franchise/settings', async (req, res) => {
    try {
        const { contact_number } = req.body;
        if (!contact_number) return res.status(400).json({ error: 'Contact number is required' });

        // Check if a row exists
        const { data: existing } = await db.from('franchise_settings').select('id').limit(1);

        let result;
        if (existing && existing.length > 0) {
            // Update
            result = await db.from('franchise_settings').update({ contact_number, updated_at: new Date() }).eq('id', existing[0].id).select();
        } else {
            // Insert
            result = await db.from('franchise_settings').insert({ contact_number }).select();
        }

        if (result.error) return res.status(500).json({ error: result.error.message });
        res.json(result.data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. FAQS
app.get('/api/franchise/faq', async (req, res) => {
    try {
        const { data, error } = await db.from('franchise_faq').select('*').order('created_at', { ascending: true });
        if (error) return res.status(500).json({ error: error.message });
        res.json(data || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/franchise/faq', async (req, res) => {
    try {
        const { question, answer } = req.body;
        if (!question || !answer) return res.status(400).json({ error: 'Question and Answer are required' });

        const { data, error } = await db.from('franchise_faq').insert({ question, answer }).select().single();
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/franchise/faq/:id', async (req, res) => {
    try {
        const { question, answer } = req.body;
        const updates = { updated_at: new Date() };
        if (question) updates.question = question;
        if (answer) updates.answer = answer;

        const { error } = await db.from('franchise_faq').update(updates).eq('id', req.params.id);
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'Updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/franchise/faq/:id', async (req, res) => {
    try {
        const { error } = await db.from('franchise_faq').delete().eq('id', req.params.id);
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. ENQUIRIES
app.get('/api/franchise/enquiries', async (req, res) => {
    try {
        const { data, error } = await db.from('franchise_enquiries').select('*').order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        res.json(data || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/franchise/enquire', async (req, res) => {
    try {
        const { full_name, contact_number, email, enquiry } = req.body;
        if (!full_name || !contact_number || !enquiry) {
            return res.status(400).json({ error: 'Name, Contact, and Enquiry are required' });
        }

        const { data, error } = await db.from('franchise_enquiries').insert({
            full_name,
            contact_number,
            email,
            enquiry,
            status: 'New' // Default status
        }).select().single();

        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'Enquiry submitted successfully', id: data.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/franchise/enquiries/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ error: 'Status is required' });

        const { error } = await db.from('franchise_enquiries')
            .update({ status })
            .eq('id', req.params.id);

        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/franchise/enquiries/:id', async (req, res) => {
    try {
        const { error } = await db.from('franchise_enquiries').delete().eq('id', req.params.id);
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// -----------------------------------------------------
// TRENDING ITEMS (LAST 72 HOURS)
// -----------------------------------------------------
app.get('/api/trending', async (req, res) => {
    const { data, error } = await db.from('trending_items_7d').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});

// -----------------------------------------------------
// RAZORPAY PAYMENT ENDPOINTS
// -----------------------------------------------------

// Create Razorpay order
app.post('/api/payments/create-order', async (req, res) => {
    if (!razorpayInstance) {
        return res.status(503).json({ error: 'Payment service unavailable. Razorpay not configured.' });
    }

    const { amount, currency = 'INR', customer } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    try {
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: currency,
            receipt: `order_${Date.now()}`,
            notes: {
                customer_name: customer?.name || '',
                customer_email: customer?.email || '',
                customer_phone: customer?.phone || ''
            }
        };

        const order = await razorpayInstance.orders.create(options);

        res.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(500).json({
            error: 'Failed to create payment order',
            details: error.message
        });
    }
});

// Verify payment signature
app.post('/api/payments/verify-payment', async (req, res) => {
    if (!razorpayInstance) {
        return res.status(503).json({ error: 'Payment service unavailable. Razorpay not configured.' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Missing payment verification data' });
    }

    try {
        // Verify signature
        const text = `${razorpay_order_id}|${razorpay_payment_id}`;
        const generated_signature = crypto
            .createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(401).json({ error: 'Payment verification failed. Invalid signature.' });
        }

        // Payment verified successfully
        console.log('[PAYMENT] Payment verified:', {
            order_id: razorpay_order_id,
            payment_id: razorpay_payment_id
        });

        // Create order in database
        if (orderData) {
            const { id, customer, items, total, pickupTime } = orderData;

            // Validate orderData fields (pickupTime can be empty string for store orders)
            if (!id || !customer || !items || total === undefined || pickupTime === undefined || pickupTime === null) {
                return res.status(400).json({
                    error: 'Invalid order data',
                    details: 'Required: id, customer, items, total, pickupTime (can be empty string for store orders)'
                });
            }

            // USE IST TIME for confirmed payment time
            const confirmedDate = getISTTime();

            const { data, error } = await db.from('orders').insert({
                id,
                customer: customer, // JSONB - Supabase handles object serialization
                items: items, // JSONB - Supabase handles object serialization
                total,
                date: confirmedDate,
                pickupTime: pickupTime || '', // Ensure empty string if null/undefined
                payment_status: 'PAID',
                payment_method: 'Paid Online',
                razorpay_order_id,
                razorpay_payment_id,
                status: 'placed' // Default status for new orders
            }).select().single();

            if (error) {
                console.error('[PAYMENT] Order save error after payment:', error);
                return res.status(500).json({ error: 'Payment verified but failed to save order', details: error.message });
            }
            console.log('[PAYMENT] Order saved:', id, 'at', confirmedDate);
            res.json({
                success: true,
                message: 'Payment verified and order created',
                order: { ...orderData, date: confirmedDate },
                payment_id: razorpay_payment_id
            });
        } else {
            res.json({
                success: true,
                message: 'Payment verified successfully',
                payment_id: razorpay_payment_id
            });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            error: 'Payment verification failed',
            details: error.message
        });
    }
});


// -----------------------------------------------------
// INTELLIGENT CHATBOT (GROQ + DYNAMIC CONTEXT)
// -----------------------------------------------------
import Groq from 'groq-sdk';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        // 1. Fetch Dynamic Data for Context
        const { data: menuItems } = await db.from('menu_items').select('*');
        const { data: workshops } = await db.from('workshops').select('*');
        const { data: artItems } = await db.from('art_items').select('*').eq('status', 'Available');

        // 2. Build Context String
        let context = "RABUSTE CAFE DETAILS:\n";
        context += "• Location: Rabuste Coffee, Dimpal Row House, 15, Gymkhana Rd, Piplod, Surat, Gujarat 395007, India.\n";
        context += "• About: A specialty coffee collective focused on the reclamation of Robusta coffee. Minimalist, focused on craft.\n";

        context += "\nCURRENT MENU:\n";
        // Group menu by category
        const categories = {};
        (menuItems || []).forEach(item => {
            const cat = item.category || 'Other';
            if (!categories[cat]) categories[cat] = [];

            let details = `₹${item.price}`;
            if (item.caffeine) details += ` | Caffeine: ${item.caffeine} (${item.caffeine_mg || '?'}mg)`;
            if (item.calories) details += ` | ${item.calories} kcal`;
            if (item.description) details += ` | Desc: ${item.description}`;

            categories[cat].push(`• ${item.name}: ${details}`);
        });

        for (const [cat, items] of Object.entries(categories)) {
            context += `\n${cat.toUpperCase()}:\n${items.join('\n')}\n`;
        }

        context += "\nUPCOMING WORKSHOPS:\n";
        (workshops || []).forEach(w => {
            context += `• ${w.title} on ${w.datetime} (₹${w.price}) - ${w.seats - w.booked} seats left. Desc: ${w.desc || 'Join us to learn.'}\n`;
        });

        context += "\nART GALLERY (Available):\n";
        (artItems || []).forEach(a => {
            context += `• "${a.title}" by ${a.artist_name || a.artist || 'Unknown'} (₹${a.price}). Stock: ${a.stock || 1}.\n`;
        });

        context += `
        \nNAVIGATION ROUTES (Use EXACTLY these paths):
        - Menu: /menu
        - Workshops: /workshops
        - Gallery: /art
        - About: /about
        - Find Us: /find-store
        `;

        // 3. System Prompt
        const systemPrompt = `
        You are "Rabuste Bot", the AI barista for Rabuste Cafe in Surat.
        
        KNOWLEDGE BASE (This is your ONLY source of truth):
        ${context}

        STRICT GUIDELINES:
        1. **OFF-TOPIC CHECK**: If the user asks about anything NOT related to Rabuste Cafe, coffee, our menu, art, or workshops (e.g., politics, coding, general knowledge, movies), reply EXACTLY: "I can only assist with Rabuste Cafe related queries."
        2. **ACCURACY**: Use the Caffeine content, Calories, and Descriptions provided in the Knowledge Base. Do not hallucinate.
        3. **NAVIGATION**: If the user explicitly asks to "go to", "open", or "take me to" a page, output **ONLY** a JSON object (no markdown, no extra text).
           Format: {"action": "navigate", "parameters": {"route": "/page"}}
        4. **RECOMMENDATIONS**: Be helpful. If offering a drink, mention its caffeine level or flavor profile from the descriptions.
        5. **FORMATTING**: Keep text responses clean. Use bullets (•) for lists. No bold (**).

        Example Navigation Response:
        {"action": "navigate", "parameters": {"route": "/menu"}}
        `;

        // 4. Call Groq
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3, // Lower temperature for more factual accuracy
            max_tokens: 1024,
        });

        let responseText = completion.choices[0]?.message?.content || "I needs some beans to think...";

        // 5. Clean & Parse
        // Aggressively look for JSON if it exists in the response
        const jsonMatch = responseText.match(/\{[\s\S]*"action":\s*"navigate"[\s\S]*\}/);

        let apiResponse;
        if (jsonMatch) {
            try {
                apiResponse = JSON.parse(jsonMatch[0]);
            } catch (e) {
                // Fallback if regex found something but it wasn't valid JSON
                apiResponse = {
                    action: 'respond',
                    parameters: { message: responseText } // fallback to raw text
                };
            }
        } else {
            // Cleanup markdown if it's a text response
            responseText = responseText
                .replace(/\*\*/g, '')
                .replace(/\*/g, '•')
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

            apiResponse = {
                action: 'respond',
                parameters: { message: responseText }
            };
        }

        res.json(apiResponse);

    } catch (error) {
        console.error('Chat endpoint error:', error);
        res.status(500).json({ reply: "I'm having trouble connecting to the barista brain. Please try again." });
    }
});

initDb().then(async () => {
    // Initialize knowledge index after database is ready
    await initializeKnowledge(db);
    app.listen(PORT, () => { console.log(`🚀 Intelligent Server running on http://localhost:${PORT}`); });
});
