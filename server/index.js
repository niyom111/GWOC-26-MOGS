import './env.js'; // MUST BE FIRST
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { db, initDb } from './db.js';
import { initializeKnowledge, rebuildKnowledgeIndex } from './data/knowledgeManager.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- FUSE.JS LOGIC FOR OFF-LINE CHAT ---
import Fuse from 'fuse.js';
import { knowledge } from './data/knowledge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to get IST time string
const getISTTime = () => {
    return new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
};

// -----------------------------------------------------
// CONFIGURATION & SETUP
// -----------------------------------------------------
const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow frontend domains
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (origin.startsWith('http://localhost')) return callback(null, true);
        if (origin.includes('.vercel.app')) return callback(null, true);
        if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
            return callback(null, true);
        }
        callback(null, true);
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

let razorpayInstance = null;

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
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
// OFFLINE CHATBOT LOGIC
// -----------------------------------------------------
function generateLocalResponse(message, menuItems, workshops, artItems) {
    const lowerMsg = message.toLowerCase();
    const fmt = (p) => `₹${p}`;

    // Cleanup
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
        .replace(/\b(please|kindly|hey|hi|hello|tell me)\b/g, "")
        .replace(/take me to/g, "navigate to")
        .trim();

    // Navigation
    if (lowerMsg.includes("go to") || lowerMsg.includes("show me") || lowerMsg.includes("navigate") || lowerMsg.includes("open") || lowerMsg.includes("take me")) {
        if (lowerMsg.includes("menu") && !lowerMsg.includes("item")) return { action: "navigate", parameters: { route: "/menu" } };
        if (lowerMsg.includes("art") && !lowerMsg.includes("what")) return { action: "navigate", parameters: { route: "/art" } };
        if (lowerMsg.includes("workshop") || lowerMsg.includes("event")) return { action: "navigate", parameters: { route: "/workshops" } };
        if (lowerMsg.includes("home")) return { action: "navigate", parameters: { route: "/" } };
        if (lowerMsg.includes("cart")) return { action: "navigate", parameters: { route: "/cart" } };
        if (lowerMsg.includes("philosophy")) return { action: "navigate", parameters: { route: "/philosophy" } };
        if (lowerMsg.includes("franchise")) return { action: "navigate", parameters: { route: "/franchise" } };
    }

    // Greetings
    if (lowerMsg.match(/\b(hi|hello|hey|yo|greetings)\b/)) {
        return { action: "respond", parameters: { message: "Hi! I'm your Rabuste Barista. ☕\nI can help you with:\n• **Menu & Prices**\n• **Recommendations**\n• **Store Info**" } };
    }

    // Tech Stack
    if (lowerMsg.includes("tech stack") || lowerMsg.includes("technologies") || lowerMsg.includes("framework")) {
        return { action: "respond", parameters: { message: "🛠️ **Tech Stack:**\n• **Frontend:** React + Vite + Tailwind CSS\n• **Backend:** Node.js + Express\n• **Database:** Supabase (PostgreSQL)\n• **AI:** Custom Fuse.js Fuzzy Matching 🧠" } };
    }

    // Info
    if (lowerMsg.includes("hours") || lowerMsg.includes("open") || lowerMsg.includes("close")) {
        return { action: "respond", parameters: { message: "🕒 **Opening Hours:**\n• Mon-Sun: 8:00 AM - 10:00 PM" } };
    }
    if (lowerMsg.includes("location") || lowerMsg.includes("where") || lowerMsg.includes("address")) {
        return { action: "respond", parameters: { message: "📍 **Location:**\n123 Coffee Lane, Brewtown" } };
    }

    // Menu Query - Fuse.js
    const fuse = new Fuse(menuItems, {
        keys: ['name', 'category', 'tags'],
        threshold: 0.4,
        includeScore: true
    });

    const searchResults = fuse.search(cleanQuery || lowerMsg);

    if (searchResults.length > 0) {
        const bestMatch = searchResults[0].item;
        if (lowerMsg.includes("price") || lowerMsg.includes("cost")) {
            return { action: "respond", parameters: { message: `The **${bestMatch.name}** costs **₹${bestMatch.price}**.` } };
        }
        if (lowerMsg.includes("calorie")) {
            return { action: "respond", parameters: { message: `The **${bestMatch.name}** has **${bestMatch.calories || 'N/A'} kcal**.` } };
        }
        return { action: "respond", parameters: { message: `**${bestMatch.name}**\nPrice: ₹${bestMatch.price}\nCalories: ${bestMatch.calories || 'N/A'} kcal\n\n${bestMatch.description || ''}` } };
    }

    // Fallback
    return {
        action: "respond",
        parameters: {
            message: "I'm not sure about that one! Try asking about 'latte price' or 'menu'."
        }
    };
}

import { getAIResponse, isAIReady } from './ai.js';

// CHAT ENDPOINT
app.post('/api/chat', async (req, res) => {
    const { message, context } = req.body; // Extract context
    try {
        const { data: menuItemsData } = await db.from('menu_items').select(`*, categories (name)`);
        const menuItems = (menuItemsData || []).map(item => ({
            ...item,
            category: item.categories?.name || item.category_legacy || 'Other',
            tags: item.tags || item.tags_legacy || ''
        }));

        const { data: workshops } = await db.from('workshops').select('*');
        const { data: artItems } = await db.from('art_items').select('*');

        // 1. Generate Local/Regex Response first (Fast, deterministic)
        const localResponse = generateLocalResponse(message || "", menuItems || [], workshops || [], artItems || []);

        // check if it's the fallback message
        const isFallback = localResponse.parameters?.message?.includes("I'm not sure about that one");

        if (!isFallback) {
            console.log(`[CHAT] Local matched: ${localResponse.action}`);
            return res.json(localResponse);
        }



        // 2. If local logic failed, try AI
        console.log(`[CHAT] Local fallback triggered. Calling AI...`);

        if (!isAIReady) {
            console.warn("[CHAT] AI is not ready (missing keys).");
            return res.json({
                action: "respond",
                parameters: {
                    message: "I'm having trouble connecting to my AI brain (Missing API Keys). Please check the server configuration or ask me simple questions about the menu!"
                }
            });
        }

        const history = context?.history || [];

        // Prepare Extra Context
        const extraContext = {
            workshops: workshops || [],
            artItems: artItems || [],
            knowledge: knowledge || []
        };

        const aiText = await getAIResponse(message || "", menuItems || [], history, extraContext);

        if (aiText) {
            console.log(`[CHAT] AI responded.`);
            return res.json({ action: "respond", parameters: { message: aiText } });
        }

        console.log(`[CHAT] AI failed or unavailable. Returning local fallback.`);
        res.json(localResponse);

    } catch (error) {
        console.error("Chatbot Error:", error);
        res.status(200).json({ action: 'respond', parameters: { message: "I'm having a little trouble connecting to the barista brain. Please try again! ☕" } });
    }
});

// -----------------------------------------------------
// STANDARD API ROUTES
// -----------------------------------------------------

app.get('/api/menu', async (req, res) => {
    const { data, error } = await db.from('menu_items').select(`*, categories (name), sub_categories (name)`);
    if (error) return res.status(500).json({ error: error.message });
    const flatData = (data || []).map(item => ({
        ...item,
        category: item.categories?.name || item.category_legacy,
        category_name: item.categories?.name || item.category_legacy,
        sub_category_name: item.sub_categories?.name || null,
        tags: item.tags || item.tags_legacy || ''
    }));
    res.json(flatData);
});

app.post('/api/menu', async (req, res) => {
    try {
        const { id, name, category, price, image, description, status } = req.body;
        const { data, error } = await db.from('menu_items').insert(req.body).select().single();
        if (error) throw error;
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/menu/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        delete updates.id;
        delete updates.created_at;
        delete updates.categories; // Remove joined data if present
        delete updates.sub_categories;

        const { data, error } = await db.from('menu_items').update(updates).eq('id', id).select().single();
        if (error) throw error;
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/art', async (req, res) => {
    const { data, error } = await db.from('art_items').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});

app.post('/api/art', async (req, res) => {
    try {
        const { data, error } = await db.from('art_items').insert(req.body).select().single();
        if (error) throw error;
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/art/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        delete updates.id;
        delete updates.created_at;

        const { data, error } = await db.from('art_items').update(updates).eq('id', id).select().single();
        if (error) throw error;
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/art/:id', async (req, res) => {
    try {
        const { error } = await db.from('art_items').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});


app.get('/api/workshops', async (req, res) => {
    const { data, error } = await db.from('workshops').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});

app.post('/api/workshops', async (req, res) => {
    try {
        const { data, error } = await db.from('workshops').insert(req.body).select().single();
        if (error) throw error;
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/workshops/:id', async (req, res) => {
    try {
        const workshopId = req.params.id;

        // If body has content, treat as full/partial update
        if (req.body && Object.keys(req.body).length > 0) {
            const { data, error } = await db
                .from('workshops')
                .update(req.body)
                .eq('id', workshopId)
                .select()
                .single();

            if (error) throw error;
            return res.json(data);
        }

        // Logic for reservation (decrement) if body is empty
        const { data: workshop, error: fetchError } = await db
            .from('workshops')
            .select('remaining')
            .eq('id', workshopId)
            .single();

        if (fetchError || !workshop) return res.status(404).json({ error: 'Workshop not found' });

        const newRemaining = Math.max(0, (workshop.remaining || 0) - 1);

        const { data: updated, error: updateError } = await db
            .from('workshops')
            .update({ remaining: newRemaining })
            .eq('id', workshopId)
            .select()
            .single();

        if (updateError) return res.status(500).json({ error: updateError.message });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/workshops/:id', async (req, res) => {
    try {
        const { error } = await db.from('workshops').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/orders', async (req, res) => {
    const { data, error } = await db.from('orders').select('*');
    if (error) return res.status(500).json({ error: error.message });
    const parsed = (data || []).map(r => ({ ...r, customer: typeof r.customer === 'string' ? JSON.parse(r.customer) : r.customer, items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items }));
    res.json(parsed);
});

// Helper function to decrement art item stock
async function decrementArtItemStock(artId, quantity = 1) {
    try {
        const artIdStr = String(artId).trim();
        const decrementAmount = parseInt(String(quantity)) || 1;

        if (!artIdStr) return { success: false, message: 'Invalid art item ID' };

        const { data: artItem, error: fetchError } = await db
            .from('art_items')
            .select('id, stock, status')
            .eq('id', artIdStr)
            .maybeSingle();

        if (fetchError) {
            console.error(`[STOCK] Error fetching art item ${artIdStr}:`, fetchError);
            return { success: false, message: fetchError.message };
        }

        if (!artItem) {
            return { success: false, message: 'Item not found in art_items table' };
        }

        const currentStock = parseInt(String(artItem.stock)) || 0;
        if (currentStock <= 0) {
            return { success: false, message: 'Item already out of stock' };
        }

        const newStock = Math.max(0, currentStock - decrementAmount);
        const newStatus = newStock > 0 ? 'Available' : 'Sold';

        const { error: updateError } = await db
            .from('art_items')
            .update({ stock: newStock, status: newStatus })
            .eq('id', artIdStr);

        if (updateError) {
            console.error(`[STOCK] Error updating stock for art item ${artIdStr}:`, updateError);
            return { success: false, message: updateError.message };
        }

        return { success: true, oldStock: currentStock, newStock };
    } catch (error) {
        console.error(`[STOCK] Unexpected error decrementing stock for art item ${artId}:`, error);
        return { success: false, message: error.message };
    }
}

app.post('/api/orders', async (req, res) => {
    try {
        const { id, customer, items, total, pickupTime, paymentMethod } = req.body;
        const orderDate = getISTTime();
        const { data, error } = await db.from('orders').insert({
            id,
            customer: JSON.stringify(customer),
            items: JSON.stringify(items),
            total,
            date: orderDate,
            pickupTime,
            payment_status: 'PENDING_PAYMENT',
            payment_method: paymentMethod || 'Paid at Counter',
            status: 'placed'
        }).select().single();

        if (error) {
            console.error('Order save error:', error);
            return res.status(500).json({
                error: 'Failed to save order',
                details: error.message
            });
        }
        console.log('Order saved successfully:', id, 'at', orderDate);

        // Decrement stock for art items in the order - MUST complete before response
        if (Array.isArray(items) && items.length > 0) {
            const stockUpdatePromises = items.map(async (item) => {
                if (item && item.id) {
                    const quantity = parseInt(String(item.quantity)) || 1;
                    return await decrementArtItemStock(String(item.id), quantity);
                }
                return { success: false, message: 'Invalid item structure' };
            });

            // Wait for all stock updates to complete
            const stockResults = await Promise.all(stockUpdatePromises);

            // Log results
            stockResults.forEach((result, index) => {
                if (result.success) {
                    console.log(`[STOCK] Item ${items[index]?.id}: Stock decremented successfully`);
                } else if (result.message !== 'Item not found in art_items table') {
                    // Only log if it's not just a non-art item
                    console.warn(`[STOCK] Item ${items[index]?.id}: ${result.message}`);
                }
            });
        }

        res.status(200).json({ ...req.body, date: orderDate, status: 'placed' });

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

// --- GLOBAL SETTINGS ENDPOINTS ---

app.get('/api/settings', async (req, res) => {
    try {
        // Fetch settings - assumed ID=1
        const { data, error } = await db.from('global_settings').select('*').eq('id', 1).single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
            console.error('Error fetching settings:', error);
            return res.status(500).json({ error: error.message });
        }

        // If no settings exist yet, return defaults
        const settings = data || {
            id: 1,
            art_orders_enabled: true,
            menu_orders_enabled: true,
            id: 1,
            art_orders_enabled: true,
            menu_orders_enabled: true,
            contact_info_1: '',
            contact_info_2: '',
            opening_time: '10:00',
            closing_time: '22:00'
        };

        res.json(settings);
    } catch (e) {
        console.error('Unexpected error fetching settings:', e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/settings', async (req, res) => {
    try {
        console.log('[SETTINGS] Received update request:', req.body);
        const { art_orders_enabled, menu_orders_enabled, contact_info_1, contact_info_2, opening_time, closing_time } = req.body;

        // Explicitly check if row exists first
        const { data: existing, error: fetchError } = await db.from('global_settings').select('*').eq('id', 1).single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('[SETTINGS] Error checking existence:', fetchError);
            return res.status(500).json({ error: fetchError.message });
        }

        let resultData, resultError;

        if (existing) {
            console.log('[SETTINGS] Updating existing row:', { id: 1, ...req.body });
            const { data, error } = await db.from('global_settings').update({
                art_orders_enabled,
                menu_orders_enabled,
                contact_info_1,
                contact_info_2,
                opening_time,
                closing_time,
                updated_at: new Date()
            }).eq('id', 1).select().single();
            resultData = data;
            resultError = error;
        } else {
            console.log('[SETTINGS] Inserting new row:', { id: 1, ...req.body });
            const { data, error } = await db.from('global_settings').insert({
                id: 1,
                art_orders_enabled: art_orders_enabled ?? true,
                menu_orders_enabled: menu_orders_enabled ?? true,
                contact_info_1: contact_info_1 ?? '',
                contact_info_2: contact_info_2 ?? '',
                opening_time: opening_time ?? '10:00',
                closing_time: closing_time ?? '22:00',
                updated_at: new Date()
            }).select().single();
            resultData = data;
            resultError = error;
        }

        if (resultError) {
            console.error('[SETTINGS] Database operation failed:', resultError);
            return res.status(500).json({ error: resultError.message });
        }

        console.log('[SETTINGS] Final saved data:', resultData);
        res.json(resultData);
    } catch (e) {
        console.error('[SETTINGS] Unexpected error:', e);
        res.status(500).json({ error: e.message });
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
                    bestCoffee.trending ? 'Trending' : ''
                ].filter(Boolean),
                diet_pref: bestCoffee.diet_pref,
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
                tags: [bestSnack.shareable ? 'Shareable' : 'Single', bestSnack.trending ? 'Trending' : ''].filter(Boolean),
                diet_pref: bestSnack.diet_pref
            } : null
        });

    } catch (error) {
        console.error('Recommendation Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// -----------------------------------------------------
// DYNAMIC CATEGORIES, SUB-CATEGORIES, TAGS
// -----------------------------------------------------

// CATEGORIES
app.get('/api/categories', async (req, res) => {
    const { data, error } = await db.from('categories').select('*').order('name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post('/api/categories', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name required' });
        const { data, error } = await db.from('categories').insert({ name }).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// SUB-CATEGORIES
app.get('/api/sub-categories', async (req, res) => {
    const { category_id } = req.query;
    let query = db.from('sub_categories').select('*').order('name');
    if (category_id) query = query.eq('category_id', category_id);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post('/api/sub-categories', async (req, res) => {
    try {
        const { category_id, name } = req.body;
        if (!category_id || !name) return res.status(400).json({ error: 'Category ID and Name required' });
        const { data, error } = await db.from('sub_categories').insert({ category_id, name }).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// TAGS
app.get('/api/tags', async (req, res) => {
    const { data, error } = await db.from('tags').select('*').order('name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post('/api/tags', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name required' });

        // Upsert to avoid dupes if name unique constraint exists
        const { data, error } = await db.from('tags').upsert({ name }, { onConflict: 'name' }).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// MENU ITEM TAGS
app.get('/api/menu/:id/tags', async (req, res) => {
    try {
        const { id } = req.params;
        // Join menu_item_tags -> tags
        const { data, error } = await db
            .from('menu_item_tags')
            .select(`tag_id, tags (*)`)
            .eq('menu_item_id', id);

        if (error) throw error;
        // Flatten structure
        const tags = data.map(row => row.tags);
        res.json(tags);
    } catch (e) { res.status(500).json({ error: e.message }); }
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

            // Decrement stock for art items in the order - MUST complete before response
            if (Array.isArray(items) && items.length > 0) {
                const stockUpdatePromises = items.map(async (item) => {
                    if (item && item.id) {
                        const quantity = parseInt(String(item.quantity)) || 1;
                        return await decrementArtItemStock(String(item.id), quantity);
                    }
                    return { success: false, message: 'Invalid item structure' };
                });

                // Wait for all stock updates to complete
                const stockResults = await Promise.all(stockUpdatePromises);

                // Log results
                stockResults.forEach((result, index) => {
                    if (result.success) {
                        console.log(`[STOCK] Item ${items[index]?.id}: Stock decremented successfully (UPI)`);
                    } else if (result.message !== 'Item not found in art_items table') {
                        // Only log if it's not just a non-art item
                        console.warn(`[STOCK] Item ${items[index]?.id}: ${result.message}`);
                    }
                });
            }

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
        const { data: menuItemsData } = await db.from('menu_items')
            .select(`*, categories (name)`);

        const menuItems = (menuItemsData || []).map(item => ({
            ...item,
            category: item.categories?.name || item.category_legacy || 'Other'
        }));

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
        - Cart: /cart
        - Workshops: /workshops
        - Gallery: /art
        - About/Philosophy: /philosophy
        - Robusta Story: /robusta-story
        - Find Us: /find-store
        - FAQ: /faq
        - Franchise: /franchise
        - Track Order: /track-order
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
    try {
        await initializeKnowledge(db);
        app.listen(PORT, () => { console.log(`🚀 Intelligent Server running on http://localhost:${PORT}`); });
        process.stdin.resume();
    } catch (err) {
        console.error('❌ Error starting server:', err);
        process.exit(1);
    }
}).catch(err => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
});

// Process handlers
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
