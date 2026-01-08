import './env.js'; // MUST BE FIRST
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { db, initDb } from './db.js';
import { initializeKnowledge, rebuildKnowledgeIndex, getFuseKnowledge } from './data/knowledgeManager.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Razorpay with safe error handling
let razorpayInstance = null;
// Trim whitespace from environment variables and remove quotes if present
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID?.trim().replace(/^["']|["']$/g, '') || null;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET?.trim().replace(/^["']|["']$/g, '') || null;

// Debug: Log what we found (without exposing secrets)
console.log('🔍 Environment variables check:');
console.log('   RAZORPAY_KEY_ID:', RAZORPAY_KEY_ID ? `✅ Found (${RAZORPAY_KEY_ID.length} chars)` : '❌ Missing');
console.log('   RAZORPAY_KEY_SECRET:', RAZORPAY_KEY_SECRET ? `✅ Found (${RAZORPAY_KEY_SECRET.length} chars)` : '❌ Missing');

// List all RAZORPAY related env vars for debugging
const razorpayVars = Object.keys(process.env).filter(key => key.includes('RAZORPAY'));
if (razorpayVars.length > 0) {
    console.log('   Found Razorpay env vars:', razorpayVars.join(', '));
} else {
    console.log('   ⚠️  No RAZORPAY environment variables found in process.env');
}

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
    try {
        razorpayInstance = new Razorpay({
            key_id: RAZORPAY_KEY_ID,
            key_secret: RAZORPAY_KEY_SECRET
        });
        console.log('✅ Razorpay initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Razorpay:', error.message);
    }
} else {
    console.warn('⚠️  Razorpay credentials not found. UPI payment will not be available.');
}

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Request Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Body:', JSON.stringify(req.body).substring(0, 200) + '...');
    }
    next();
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../public/media');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Sanitize filename and timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'upload-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return relative path for frontend usage
    res.json({ url: `/media/${req.file.filename}` });
});


// -----------------------------------------------------
// SESSION MEMORY STORAGE
// -----------------------------------------------------
const sessions = {};

// Helper to get current time in IST (Indian Standard Time)
const getISTTime = () => {
    return new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
};

// -----------------------------------------------------
// STANDARD API ROUTES
// -----------------------------------------------------

app.get('/api/menu', async (req, res) => {
    try {
        const { data, error } = await db.from('menu_items').select('*');
        if (error) return res.status(500).json({ error: error.message });
        res.json(data || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/menu', async (req, res) => {
    try {
        const {
            id,
            name,
            category,
            price,
            caffeine,
            caffeine_mg,
            milk_based,
            calories,
            shareable,
            intensity_level,
            image,
            description,
            tags,
        } = req.body;

        const { data, error } = await db.from('menu_items').insert({
            id,
            name,
            category,
            price,
            caffeine,
            caffeine_mg: caffeine_mg ?? null,
            milk_based: milk_based ?? null,
            calories: calories ?? null,
            shareable: shareable ?? null,
            intensity_level: intensity_level ?? null,
            image,
            description,
            tags,
        }).select().single();

        if (error) return res.status(500).json({ error: error.message });
        res.json({ id, ...req.body });
        // Rebuild knowledge index after adding menu item
        rebuildKnowledgeIndex(db).catch(err => console.error('Error rebuilding knowledge after menu POST:', err));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/menu/:id', async (req, res) => {
    try {
        const {
            name,
            category,
            price,
            caffeine,
            caffeine_mg,
            milk_based,
            calories,
            shareable,
            intensity_level,
            image,
            description,
            tags,
        } = req.body;

        // Build update object with only defined fields
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (category !== undefined) updateData.category = category;
        if (price !== undefined) updateData.price = price;
        if (caffeine !== undefined) updateData.caffeine = caffeine;
        if (caffeine_mg !== undefined) updateData.caffeine_mg = caffeine_mg;
        if (milk_based !== undefined) updateData.milk_based = milk_based;
        if (calories !== undefined) updateData.calories = calories;
        if (shareable !== undefined) updateData.shareable = shareable;
        if (intensity_level !== undefined) updateData.intensity_level = intensity_level;
        if (image !== undefined) updateData.image = image;
        if (description !== undefined) updateData.description = description;
        if (tags !== undefined) updateData.tags = tags;

        const { error } = await db.from('menu_items')
            .update(updateData)
            .eq('id', req.params.id);

        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: "Updated" });
        // Rebuild knowledge index after updating menu item
        rebuildKnowledgeIndex(db).catch(err => console.error('Error rebuilding knowledge after menu PUT:', err));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.delete('/api/menu/:id', async (req, res) => {
    try {
        const { error } = await db.from('menu_items')
            .delete()
            .eq('id', req.params.id);

        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: "Deleted" });
        // Rebuild knowledge index after deleting menu item
        rebuildKnowledgeIndex(db).catch(err => console.error('Error rebuilding knowledge after menu DELETE:', err));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/art', async (req, res) => {
    try {
        const { data, error } = await db.from('art_items').select('*');
        if (error) return res.status(500).json({ error: error.message });
        res.json(data || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/art', async (req, res) => {
    try {
        const { id, title, price, status, image, stock, artist_name, artist_bio, description } = req.body;
        // 'artist' column still exists in DB for backward compatibility, use artist_name if provided
        const artist = artist_name || "";

        const { data, error } = await db.from('art_items').insert({
            id,
            title,
            artist,
            price,
            status,
            image,
            stock: stock || 1,
            artist_name: artist_name || null,
            artist_bio: artist_bio || null,
            description: description || null
        }).select().single();

        if (error) return res.status(500).json({ error: error.message });
        res.json(req.body);
        // Rebuild knowledge index after adding art item
        rebuildKnowledgeIndex(db).catch(err => console.error('Error rebuilding knowledge after art POST:', err));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/art/:id', async (req, res) => {
    try {
        const { title, artist, status, price, image, stock, artist_name, artist_bio, description } = req.body;

        // Build update object with only defined fields
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (artist !== undefined) updateData.artist = artist;
        if (status !== undefined) updateData.status = status;
        if (price !== undefined) updateData.price = price;
        if (image !== undefined) updateData.image = image;
        if (stock !== undefined) updateData.stock = stock;
        if (artist_name !== undefined) updateData.artist_name = artist_name;
        if (artist_bio !== undefined) updateData.artist_bio = artist_bio;
        if (description !== undefined) updateData.description = description;

        const { error } = await db.from('art_items')
            .update(updateData)
            .eq('id', req.params.id);

        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: "Updated" });
        // Rebuild knowledge index after updating art item
        rebuildKnowledgeIndex(db).catch(err => console.error('Error rebuilding knowledge after art PUT:', err));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.delete('/api/art/:id', async (req, res) => {
    try {
        const { error } = await db.from('art_items')
            .delete()
            .eq('id', req.params.id);

        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: "Deleted" });
        // Rebuild knowledge index after deleting art item
        rebuildKnowledgeIndex(db).catch(err => console.error('Error rebuilding knowledge after art DELETE:', err));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/workshops', async (req, res) => {
    try {
        const { data, error } = await db.from('workshops').select('*');
        if (error) return res.status(500).json({ error: error.message });
        res.json(data || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/orders', async (req, res) => {
    try {
        const { data, error } = await db.from('orders').select('*');
        if (error) return res.status(500).json({ error: error.message });
        // Parse JSON fields (PostgreSQL stores JSON as JSONB, Supabase returns as objects)
        const parsed = (data || []).map(r => ({
            ...r,
            customer: typeof r.customer === 'string' ? JSON.parse(r.customer) : r.customer,
            items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items
        }));
        res.json(parsed);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/orders', async (req, res) => {
    console.log('[ORDER CREATE] Request received:', {
        hasId: !!req.body.id,
        hasCustomer: !!req.body.customer,
        hasItems: !!req.body.items,
        hasTotal: req.body.total !== undefined,
        hasPickupTime: !!req.body.pickupTime,
        paymentMethod: req.body.paymentMethod
    });
    try {
        const { id, customer, items, total, date, pickupTime, paymentMethod } = req.body;

        // Validation
        if (!id || !customer || !items || total === undefined || !pickupTime) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'Required: id, customer, items, total, pickupTime'
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
            razorpay_payment_id: null
        }).select().single();

        if (error) {
            console.error('Order save error:', error);
            return res.status(500).json({
                error: 'Failed to save order',
                details: error.message
            });
        }
        console.log('Order saved successfully:', id, 'at', orderDate);
        res.status(200).json({ ...req.body, date: orderDate });
    } catch (error) {
        console.error('Unexpected error in order creation:', error);
        return res.status(500).json({
            error: 'Unexpected server error',
            details: error.message
        });
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
                if (b.score !== a.score) return b.score - a.score;
                // If Work/Weak, prioritize higher caffeine
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
// TRENDING ITEMS (LAST 72 HOURS)
// -----------------------------------------------------
app.get('/api/trending', async (req, res) => {
    try {
        const now = new Date();
        const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);
        const cutoffTime = seventyTwoHoursAgo.toISOString();

        const { data: rows, error } = await db
            .from('orders')
            .select('*')
            .gte('date', cutoffTime);

        if (error) {
            console.error('Trending query error:', error);
            return res.status(500).json({ error: 'Failed to fetch trending items' });
        }

        // Parse orders and extract items
        const itemOrderCounts = new Map(); // item_id -> { count: number, mostRecentTime: string }

        (rows || []).forEach(orderRow => {
            try {
                // PostgreSQL JSONB fields are already objects, but handle string case too
                const items = typeof orderRow.items === 'string' ? JSON.parse(orderRow.items) : orderRow.items;
                const orderDate = orderRow.date;

                // Use a Set to track unique items in this order (count order, not quantity)
                const uniqueItemIds = new Set();
                items.forEach(item => {
                    uniqueItemIds.add(item.id);
                });

                // Count each unique item once per order
                uniqueItemIds.forEach(itemId => {
                    if (!itemOrderCounts.has(itemId)) {
                        itemOrderCounts.set(itemId, {
                            count: 0,
                            mostRecentTime: orderDate
                        });
                    }
                    const entry = itemOrderCounts.get(itemId);
                    entry.count += 1;
                    // Update most recent time if this order is newer
                    if (orderDate > entry.mostRecentTime) {
                        entry.mostRecentTime = orderDate;
                    }
                });
            } catch (parseErr) {
                console.error('Error parsing order items:', parseErr);
            }
        });

        // Convert to array and sort
        const trendingItems = Array.from(itemOrderCounts.entries()).map(([itemId, data]) => ({
            itemId,
            recentOrderCount: data.count,
            mostRecentTime: data.mostRecentTime
        }));

        // Sort by count (desc), then by mostRecentTime (desc)
        trendingItems.sort((a, b) => {
            if (b.recentOrderCount !== a.recentOrderCount) {
                return b.recentOrderCount - a.recentOrderCount;
            }
            return new Date(b.mostRecentTime) - new Date(a.mostRecentTime);
        });

        // Only proceed if we have at least 3 items
        if (trendingItems.length < 3) {
            return res.json({ items: [] });
        }

        // Limit to top 5
        const topItems = trendingItems.slice(0, 5);
        const itemIds = topItems.map(item => item.itemId);

        // Fetch menu item details
        const { data: menuRows, error: menuError } = await db
            .from('menu_items')
            .select('*')
            .in('id', itemIds);

        if (menuError) {
            console.error('Menu items query error:', menuError);
            return res.status(500).json({ error: 'Failed to fetch menu items' });
        }

        // Map menu items by ID and attach order count
        const menuMap = new Map((menuRows || []).map(row => [row.id, row]));
        const result = topItems
            .map(trendingItem => {
                const menuItem = menuMap.get(trendingItem.itemId);
                if (!menuItem) return null;
                return {
                    ...menuItem,
                    recentOrderCount: trendingItem.recentOrderCount
                };
            })
            .filter(item => item !== null);

        res.json({ items: result });
    } catch (error) {
        console.error('Trending endpoint error:', error);
        res.status(500).json({ error: 'Failed to fetch trending items' });
    }
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

            // USE IST TIME for confirmed payment time
            const confirmedDate = getISTTime();

            const { data, error } = await db.from('orders').insert({
                id,
                customer: customer, // JSONB - Supabase handles object serialization
                items: items, // JSONB - Supabase handles object serialization
                total,
                date: confirmedDate,
                pickupTime,
                payment_status: 'PAID',
                payment_method: 'Paid Online',
                razorpay_order_id,
                razorpay_payment_id
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
// INTELLIGENT CHATBOT
// -----------------------------------------------------
// Knowledge index is managed by knowledgeManager.js and updated dynamically

app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const msg = message.toLowerCase();

        // Initialize Session
        if (sessionId && !sessions[sessionId]) {
            sessions[sessionId] = { lastContext: null, lastCategory: null };
        }
        const session = sessionId ? sessions[sessionId] : { lastContext: null };

        // --- 1. DOMAIN CLASSIFICATION ---
        // Separate Art/Workshop/Menu domains to prevents "Fries for Art"
        const artKeywords = ['art', 'gallery', 'painting', 'artist', 'piece'];
        const workshopKeywords = ['workshop', 'class', 'learn', 'course'];

        const isArt = artKeywords.some(k => msg.includes(k));
        const isWorkshop = workshopKeywords.some(k => msg.includes(k));

        // --- 2. RECOMMENDATION SIGNALS ---
        const recTriggers = ['suggest', 'recommend', 'good', 'want', 'like', 'try', 'need', 'ordering', 'have'];
        const isRecTrigger = recTriggers.some(t => msg.includes(t));

        const isPriceSort = msg.includes('cheap') || msg.includes('expensive') || msg.includes('cost') || msg.includes('lowest') || msg.includes('highest') || msg.includes('price');

        const isTired = msg.includes('tired') || msg.includes('sleepy') || msg.includes('wake') || msg.includes('energy') || msg.includes('caffeine') || msg.includes('buzz');


        // --- 3. EXECUTION LOGIC ---

        // === A. ART DOMAIN ===
        if (isArt) {
            const { data: rows, error } = await db
                .from('art_items')
                .select('*')
                .eq('status', 'Available');

            if (error) return res.json({ reply: "I can't check the gallery right now." });

            if (!rows || rows.length === 0) return res.json({ reply: "Currently, all our art pieces are sold out. Check back soon!" });

            if (isRecTrigger || isPriceSort) {
                // Determine best art
                let winner = rows[Math.floor(Math.random() * rows.length)];
                if (msg.includes('cheap')) winner = rows.reduce((prev, curr) => prev.price < curr.price ? prev : curr);
                if (msg.includes('expensive')) winner = rows.reduce((prev, curr) => prev.price > curr.price ? prev : curr);

                const artistName = winner.artist_name || winner.artist || 'Unknown Artist';
                return res.json({ reply: `For art, I recommend **"${winner.title}"** by ${artistName} (₹${winner.price}). It's a stunning piece.` });
            }

            // General List
            const artList = rows.map(a => {
                const artistName = a.artist_name || a.artist || 'Unknown Artist';
                return `- "${a.title}" by ${artistName} (₹${a.price})`;
            }).join('\n');
            return res.json({ reply: `Here are the available art pieces in our gallery:\n\n${artList}` });
        }

        // === B. WORKSHOP DOMAIN ===
        if (isWorkshop) {
            const { data: rows, error } = await db
                .from('workshops')
                .select('*');

            if (error) return res.json({ reply: "I can't check workshops right now." });
            if (!rows || rows.length === 0) return res.json({ reply: "No workshops are scheduled at the moment." });

            const workshops = rows.map(w => {
                const available = w.seats - w.booked;
                return `- ${w.title} on ${w.datetime} (₹${w.price})\n  ${available > 0 ? `${available} seats left` : 'SOLD OUT'}`;
            }).join('\n\n');
            return res.json({ reply: `Upcoming Workshops:\n\n${workshops}` });
        }

        // === C. MENU RECOMMENDATION DOMAIN ===
        const isFollowUp = msg.includes('then') || msg.includes('what about') || msg.includes('how about') || msg.includes('and');

        // DETECT CURRENT CONTEXT
        const foodKeywords = ['food', 'eat', 'snack', 'bite', 'hungry', 'side', 'bagel', 'croissant', 'fries', 'pizza', 'sandwich', 'burger'];
        const drinkKeywords = ['drink', 'coffee', 'tea', 'latte', 'brew', 'sip', 'thirsty', 'cold', 'hot', 'refreshing', 'shake'];

        let currentContext = null;
        if (foodKeywords.some(k => msg.includes(k))) currentContext = 'food';
        else if (drinkKeywords.some(k => msg.includes(k))) currentContext = 'drink';

        // Merge Context
        let activeContext = currentContext;
        if (isFollowUp && !activeContext && session.lastContext) {
            activeContext = session.lastContext;
        }

        // Refine Drink Context
        let subCategory = null;
        if (activeContext === 'drink' || !activeContext) {
            if (msg.includes('tea') || (session.lastCategory === 'tea' && isFollowUp)) subCategory = 'tea';
            else if (msg.includes('coffee') || (session.lastCategory === 'coffee' && isFollowUp)) subCategory = 'coffee';
            else if (msg.includes('shake') || (session.lastCategory === 'shake' && isFollowUp)) subCategory = 'shake';

            if (subCategory) activeContext = 'drink';
        }

        // EXECUTE MENU QUERY
        // Only enter if explicit triggers OR context OR Tired (which implies drink)
        if (isRecTrigger || isPriceSort || isFollowUp || activeContext || isTired) {

            let query = db.from('menu_items').select('*');
            let limit = 3;

            // ENERGY LOGIC (Updates Context IMPLICITLY)
            if (isTired) {
                query = query.or('caffeine.eq.Very High,caffeine.eq.Extreme');
                activeContext = 'drink';
                limit = 1; // Give the BEST energy boost
            }

            // FILTERING
            if (activeContext === 'food') {
                query = query.or('category.ilike.%Food%,tags.ilike.%food%,tags.ilike.%snack%,tags.ilike.%meal%');
            } else if (activeContext === 'drink') {
                query = query.not('category', 'ilike', '%Food%');
                // Subcategory Filtering
                if (subCategory === 'coffee') {
                    query = query.or('category.ilike.%Robusta%,category.ilike.%Blend%,tags.ilike.%coffee%');
                }
                if (subCategory === 'tea') {
                    query = query.or('category.ilike.%Tea%,tags.ilike.%tea%');
                }
                if (subCategory === 'shake') {
                    query = query.or('category.ilike.%Shake%,tags.ilike.%milk%');
                }
            }

            // PRICE SORTING
            const isCheapest = msg.includes('cheap') || msg.includes('lowest') || msg.includes('least');
            const isExpensive = msg.includes('expensive') || msg.includes('highest') || msg.includes('most');

            if (isPriceSort) {
                limit = 1;
                if (isCheapest) {
                    query = query.order('price', { ascending: true });
                } else if (isExpensive) {
                    query = query.order('price', { ascending: false });
                }
            }
            // Note: For random, we'll fetch more and shuffle in JS

            // TASTE / FLAVOR MATCHING
            const flavorKeywords = ['strong', 'sweet', 'cold', 'hot', 'fruity', 'milky', 'creamy', 'chocolate', 'spicy', 'savory'];
            const foundFlavors = flavorKeywords.filter(k => msg.includes(k));
            if (foundFlavors.length > 0) {
                const flavorConditions = foundFlavors.map(f => `tags.ilike.%${f}%`).join(',');
                query = query.or(flavorConditions);
            }

            // Fetch more rows for random selection if needed
            const fetchLimit = isPriceSort ? limit : Math.min(limit * 3, 50);
            query = query.limit(fetchLimit);

            const { data: rows, error } = await query;

            if (error) return res.json({ reply: "I'm having a brain freeze. Try again?" });

            // UPDATE SESSION MEMORY
            if (sessionId) {
                if (activeContext) sessions[sessionId].lastContext = activeContext;
                if (subCategory) sessions[sessionId].lastCategory = subCategory;
            }

            // Shuffle if not price sorted (to simulate RANDOM())
            let shuffledRows = rows || [];
            if (!isPriceSort && shuffledRows.length > 0) {
                shuffledRows = shuffledRows.sort(() => Math.random() - 0.5).slice(0, limit);
            }

            if (shuffledRows.length === 0) {
                if (isPriceSort) return res.json({ reply: `I couldn't find any items matching those criteria.` });

                // FALLTHROUGH to Knowledge if Menu search fails (e.g. "Suggest story?")
                const fuseKnowledge = getFuseKnowledge();
                if (fuseKnowledge) {
                    const fuseRes = fuseKnowledge.search(msg);
                    if (fuseRes.length > 0) return res.json({ reply: fuseRes[0].item.response });
                }

                return res.json({ reply: "I'm not sure. Try asking for 'coffee', 'food', or 'help'." });
            }

            // SMART RESPONSE GENERATION
            const item = shuffledRows[0];

            if (isTired) {
                return res.json({ reply: `Need a boost? The **${item.name}** packs **${item.caffeine} Caffeine**. It will wake you up!` });
            }

            if (isPriceSort) {
                const adj = isCheapest ? "cheapest" : "most premium";
                const cat = activeContext ? activeContext : "item";
                return res.json({ reply: `The **${adj} ${cat}** we have is the **${item.name}** at ₹${item.price}.` });
            }

            const itemTags = item.tags ? item.tags.split(',').slice(0, 3).join(', ') : 'a great choice';
            return res.json({
                reply: `I suggest the **${item.name}** (₹${item.price}).\n\nIt's ${itemTags}.`
            });
        }

        // --- FALLBACK: KNOWLEDGE BASE ---
        const fuseKnowledge = getFuseKnowledge();
        if (fuseKnowledge) {
            const results = fuseKnowledge.search(msg);
            if (results.length > 0) return res.json({ reply: results[0].item.response });
        }

        // --- FALLBACK: GENERAL MENU/HELP ---
        if (msg.includes('menu')) return res.json({ reply: "Ask me to 'suggest a drink' or 'show food options'!" });

        res.json({ reply: "I didn't quite catch that. Im a smart barista, try asking me 'What is the cheapest coffee?' or 'Suggest a snack'!" });
    } catch (error) {
        console.error('Chat endpoint error:', error);
        res.json({ reply: "I'm having trouble right now. Please try again!" });
    }
});

initDb().then(async () => {
    // Initialize knowledge index after database is ready
    await initializeKnowledge(db);
    app.listen(PORT, () => { console.log(`🚀 Intelligent Server running on http://localhost:${PORT}`); });
});
