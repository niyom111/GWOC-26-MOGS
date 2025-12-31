import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

// Safely load .env file - try multiple paths
const possiblePaths = [
    path.join(__dirname, '../.env'),           // Relative to server directory
    path.resolve(process.cwd(), '.env'),       // Current working directory
    path.join(process.cwd(), '.env')           // Alternative cwd path
];

let envLoaded = false;
for (const envPath of possiblePaths) {
    const envPathAbsolute = path.resolve(envPath);
    if (fs.existsSync(envPath)) {
        console.log('🔍 Found .env file at:', envPathAbsolute);

        // Read file to check for errors
        const fileContent = fs.readFileSync(envPath, 'utf8');
        const hasRazorpayKeyId = fileContent.includes('RAZORPAY_KEY_ID');
        const hasRazorpaySecret = fileContent.includes('RAZORPAY_KEY_SECRET');
        const allLines = fileContent.split('\n');
        const nonEmptyLines = allLines.filter(line => line.trim().length > 0);

        // Check if file is empty or has no content
        if (fileContent.trim().length === 0) {
            console.error('❌ ERROR: .env file is EMPTY!');
            console.error('   File location:', envPathAbsolute);
            console.error('   Please add the following to your .env file:');
            console.error('   RAZORPAY_KEY_ID=your_key_id_here');
            console.error('   RAZORPAY_KEY_SECRET=your_secret_here');
            console.error('   VITE_RAZORPAY_KEY_ID=your_key_id_here');
            console.error('   (No spaces around the = sign, no quotes needed)');
        } else if (!hasRazorpayKeyId || !hasRazorpaySecret) {
            console.error('❌ ERROR: Razorpay variables not found in .env file!');
            console.error('   File location:', envPathAbsolute);
            console.error('   File size:', fileContent.length, 'bytes');
            console.error('   Non-empty lines:', nonEmptyLines.length);
            if (nonEmptyLines.length > 0) {
                console.error('   First few lines in file:');
                nonEmptyLines.slice(0, 3).forEach((line, idx) => {
                    console.error(`     ${idx + 1}. ${line.trim().substring(0, 60)}`);
                });
            }
            console.error('   Required variables:');
            console.error('   - RAZORPAY_KEY_ID');
            console.error('   - RAZORPAY_KEY_SECRET');
            console.error('   - VITE_RAZORPAY_KEY_ID');
        }

        const result = dotenv.config({ path: envPath });

        if (result.error) {
            console.error('❌ Error loading .env file:', result.error);
        } else {
            console.log('✅ .env file loaded successfully from:', envPathAbsolute);
            envLoaded = true;
            break;
        }
    }
}

if (!envLoaded) {
    console.warn('⚠️  .env file not found in any of these locations:');
    possiblePaths.forEach(p => console.warn('   -', path.resolve(p)));
    // Try loading from current working directory as final fallback
    dotenv.config();
    console.log('🔄 Attempted to load .env from current working directory');
}

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

app.get('/api/menu', (req, res) => {
    db.all("SELECT * FROM menu_items", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});
app.post('/api/menu', (req, res) => {
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

    db.run(
        "INSERT INTO menu_items (id, name, category, price, caffeine, caffeine_mg, milk_based, calories, shareable, intensity_level, image, description, tags) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [
            id,
            name,
            category,
            price,
            caffeine,
            caffeine_mg ?? null,
            milk_based ?? null,
            calories ?? null,
            shareable ?? null,
            intensity_level ?? null,
            image,
            description,
            tags,
        ],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id, ...req.body });
            // Rebuild knowledge index after adding menu item
            rebuildKnowledgeIndex(db).catch(err => console.error('Error rebuilding knowledge after menu POST:', err));
        }
    );
});
app.put('/api/menu/:id', (req, res) => {
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
    let sql = "UPDATE menu_items SET ";
    const params = [];

    // Dynamically build query to prevent overwriting with null
    if (name !== undefined) { sql += "name = ?, "; params.push(name); }
    if (category !== undefined) { sql += "category = ?, "; params.push(category); }
    if (price !== undefined) { sql += "price = ?, "; params.push(price); }
    if (caffeine !== undefined) { sql += "caffeine = ?, "; params.push(caffeine); }
    if (caffeine_mg !== undefined) { sql += "caffeine_mg = ?, "; params.push(caffeine_mg); }
    if (milk_based !== undefined) { sql += "milk_based = ?, "; params.push(milk_based); }
    if (calories !== undefined) { sql += "calories = ?, "; params.push(calories); }
    if (shareable !== undefined) { sql += "shareable = ?, "; params.push(shareable); }
    if (intensity_level !== undefined) { sql += "intensity_level = ?, "; params.push(intensity_level); }
    if (image !== undefined) { sql += "image = ?, "; params.push(image); }
    if (description !== undefined) { sql += "description = ?, "; params.push(description); }
    if (tags !== undefined) { sql += "tags = ?, "; params.push(tags); }

    sql = sql.slice(0, -2) + " WHERE id = ?";
    params.push(req.params.id);

    db.run(sql, params, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Updated" });
        // Rebuild knowledge index after updating menu item
        rebuildKnowledgeIndex(db).catch(err => console.error('Error rebuilding knowledge after menu PUT:', err));
    });
});
app.delete('/api/menu/:id', (req, res) => {
    db.run("DELETE FROM menu_items WHERE id = ?", req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Deleted" });
        // Rebuild knowledge index after deleting menu item
        rebuildKnowledgeIndex(db).catch(err => console.error('Error rebuilding knowledge after menu DELETE:', err));
    });
});

app.get('/api/art', (req, res) => {
    db.all("SELECT * FROM art_items", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});
app.post('/api/art', (req, res) => {
    const { id, title, price, status, image, stock, artist_name, artist_bio, description } = req.body;
    // 'artist' column still exists in DB for backward compatibility, use artist_name if provided
    const artist = artist_name || "";
    db.run("INSERT INTO art_items (id, title, artist, price, status, image, stock, artist_name, artist_bio, description) VALUES (?,?,?,?,?,?,?,?,?,?)",
        [id, title, artist, price, status, image, stock || 1, artist_name || null, artist_bio || null, description || null], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(req.body);
            // Rebuild knowledge index after adding art item
            rebuildKnowledgeIndex(db).catch(err => console.error('Error rebuilding knowledge after art POST:', err));
        });
});
app.put('/api/art/:id', (req, res) => {
    const { title, artist, status, price, image, stock, artist_name, artist_bio, description } = req.body;
    let sql = "UPDATE art_items SET ";
    const params = [];

    if (title !== undefined) { sql += "title = ?, "; params.push(title); }
    if (artist !== undefined) { sql += "artist = ?, "; params.push(artist); }
    if (status !== undefined) { sql += "status = ?, "; params.push(status); }
    if (price !== undefined) { sql += "price = ?, "; params.push(price); }
    if (image !== undefined) { sql += "image = ?, "; params.push(image); }
    if (stock !== undefined) { sql += "stock = ?, "; params.push(stock); }
    if (artist_name !== undefined) { sql += "artist_name = ?, "; params.push(artist_name); }
    if (artist_bio !== undefined) { sql += "artist_bio = ?, "; params.push(artist_bio); }
    if (description !== undefined) { sql += "description = ?, "; params.push(description); }

    sql = sql.slice(0, -2) + " WHERE id = ?";
    params.push(req.params.id);
    db.run(sql, params, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Updated" });
        // Rebuild knowledge index after updating art item
        rebuildKnowledgeIndex(db).catch(err => console.error('Error rebuilding knowledge after art PUT:', err));
    });
});
app.delete('/api/art/:id', (req, res) => {
    db.run("DELETE FROM art_items WHERE id = ?", req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Deleted" });
        // Rebuild knowledge index after deleting art item
        rebuildKnowledgeIndex(db).catch(err => console.error('Error rebuilding knowledge after art DELETE:', err));
    });
});

app.get('/api/workshops', (req, res) => {
    db.all("SELECT * FROM workshops", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});
app.get('/api/orders', (req, res) => {
    db.all("SELECT * FROM orders", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const parsed = rows.map(r => ({ ...r, customer: JSON.parse(r.customer), items: JSON.parse(r.items) }));
        res.json(parsed);
    });
});
app.post('/api/orders', (req, res) => {
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

        const customerJson = JSON.stringify(customer);
        const itemsJson = JSON.stringify(items);

        // USE IST TIME
        const orderDate = getISTTime();

        // Insert order with all columns: include payment_status, payment_method, and NULL payment IDs for counter orders
        const sqlQuery = "INSERT INTO orders (id, customer, items, total, date, pickupTime, payment_status, payment_method, razorpay_order_id, razorpay_payment_id) VALUES (?,?,?,?,?,?,?,?,?,?)";
        const sqlParams = [id, customerJson, itemsJson, total, orderDate, pickupTime, payment_status, normalizedPaymentMethod, null, null];

        db.run(sqlQuery, sqlParams, (err) => {
            if (err) {
                console.error('Order save error:', err);
                console.error('SQL Query:', sqlQuery);
                console.error('SQL Params:', sqlParams);
                return res.status(500).json({
                    error: 'Failed to save order',
                    details: err.message
                });
            }
            console.log('Order saved successfully:', id, 'at', orderDate);
            res.status(200).json({ ...req.body, date: orderDate });
        });
    } catch (error) {
        console.error('Unexpected error in order creation:', error);
        return res.status(500).json({
            error: 'Unexpected server error',
            details: error.message
        });
    }
});

// -----------------------------------------------------
// BREWDESK VIBE-BASED RECOMMENDATIONS
// -----------------------------------------------------
app.post('/api/recommendations/context', (req, res) => {
    const { mood, activity } = req.body || {};

    const validMoods = ['Energetic', 'Weak', 'Comfort'];
    const validActivities = ['Work', 'Hangout', 'Chill'];
    if (!validMoods.includes(mood) || !validActivities.includes(activity)) {
        return res.status(400).json({ error: 'Invalid mood or activity' });
    }

    const classifyStrength = (mg) => {
        if (mg == null) return 'medium';
        if (mg < 140) return 'light';
        if (mg <= 220) return 'medium';
        return 'strong';
    };

    const strengthWeights = {
        Energetic: { light: 2, medium: 1, strong: -1 },
        Weak:      { light: -1, medium: 1, strong: 3 },
        Comfort:   { light: 1, medium: 3, strong: 1 },
    };

    const snackWeights = {
        Work:    { lightSnack: 3, shareable: -1, trending: 0 },
        Hangout: { lightSnack: 0, shareable: 3, trending: 1 },
        Chill:   { lightSnack: 0, shareable: 1, trending: 3 },
    };

    const sql = `
    SELECT
      m.*,
      COALESCE(t.total_quantity, 0) AS trendCount
    FROM menu_items m
    LEFT JOIN trending_items_7d t
      ON t.item_id = m.id;
  `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('BrewDesk query error:', err);
            return res.status(500).json({ error: 'Failed to compute recommendations' });
        }

        // Snacks: category contains "Food & Bagels"
        const snacks = rows.filter((row) =>
            row.category && row.category.toLowerCase().includes('food & bagels')
        );

        // Coffee/Drinks: everything else
        const coffees = rows.filter((row) => !snacks.includes(row));

        let bestCoffee = null;
        if (coffees.length > 0) {
            const moodWeights = strengthWeights[mood];

            const scoredCoffees = coffees.map((row) => {
                const caffeineMg = typeof row.caffeine_mg === 'number' ? row.caffeine_mg : null;
                const strength = classifyStrength(caffeineMg);
                let score = moodWeights[strength] || 0;

                const trendCount = row.trendCount || 0;
                if (trendCount > 0) score += 2;

                return {
                    row,
                    score,
                    strength,
                    trendCount,
                    caffeineMg,
                };
            });

            scoredCoffees.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                if (b.trendCount !== a.trendCount) return b.trendCount - a.trendCount;
                const aMg = a.caffeineMg == null ? 0 : a.caffeineMg;
                const bMg = b.caffeineMg == null ? 0 : b.caffeineMg;
                if (bMg !== aMg) return bMg - aMg;
                return a.row.price - b.row.price;
            });

            const top = scoredCoffees[0];
            bestCoffee = {
                id: top.row.id,
                name: top.row.name,
                category: top.row.category,
                price: top.row.price,
                image: top.row.image || null,
                description: top.row.description || null,
                caffeine_mg: typeof top.row.caffeine_mg === 'number' ? top.row.caffeine_mg : null,
                milk_based: top.row.milk_based == null ? null : !!top.row.milk_based,
                score: top.score,
                trendCount: top.trendCount,
                strength: top.strength,
                trending: top.trendCount > 0,
            };
        }

        let bestSnack = null;
        if (snacks.length > 0) {
            const w = snackWeights[activity];

            const scoredSnacks = snacks.map((row) => {
                const calories = typeof row.calories === 'number' ? row.calories : null;
                const shareableFlag = row.shareable == null ? null : !!row.shareable;
                const trendCount = row.trendCount || 0;

                const lightSnack = calories != null && calories <= 250;
                const shareable = shareableFlag === true;
                const trending = trendCount > 0;

                let score = 0;
                if (lightSnack) score += w.lightSnack || 0;
                if (shareable) score += w.shareable || 0;
                if (trending) score += w.trending || 0;
                if (trendCount > 0) score += 2;

                return {
                    row,
                    score,
                    trendCount,
                    calories,
                    lightSnack,
                    shareable,
                    trending,
                };
            });

            scoredSnacks.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                if (b.trendCount !== a.trendCount) return b.trendCount - a.trendCount;
                const aCal = a.calories == null ? Number.MAX_SAFE_INTEGER : a.calories;
                const bCal = b.calories == null ? Number.MAX_SAFE_INTEGER : b.calories;
                if (aCal !== bCal) return aCal - bCal;
                return a.row.price - b.row.price;
            });

            const top = scoredSnacks[0];
            bestSnack = {
                id: top.row.id,
                name: top.row.name,
                category: top.row.category,
                price: top.row.price,
                image: top.row.image || null,
                description: top.row.description || null,
                calories: top.calories,
                shareable: top.row.shareable == null ? null : !!top.row.shareable,
                score: top.score,
                trendCount: top.trendCount,
                lightSnack: top.lightSnack,
                trending: top.trending,
            };
        }

        res.json({
            coffee: bestCoffee,
            snack: bestSnack,
        });
    });
});

// -----------------------------------------------------
// TRENDING ITEMS (LAST 72 HOURS)
// -----------------------------------------------------
app.get('/api/trending', (req, res) => {
    const now = new Date();
    const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);
    const cutoffTime = seventyTwoHoursAgo.toISOString();

    db.all("SELECT * FROM orders WHERE date >= ?", [cutoffTime], (err, rows) => {
        if (err) {
            console.error('Trending query error:', err);
            return res.status(500).json({ error: 'Failed to fetch trending items' });
        }

        // Parse orders and extract items
        const itemOrderCounts = new Map(); // item_id -> { count: number, mostRecentTime: string }
        
        rows.forEach(orderRow => {
            try {
                const items = JSON.parse(orderRow.items);
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
        const placeholders = itemIds.map(() => '?').join(',');
        db.all(
            `SELECT * FROM menu_items WHERE id IN (${placeholders})`,
            itemIds,
            (err2, menuRows) => {
                if (err2) {
                    console.error('Menu items query error:', err2);
                    return res.status(500).json({ error: 'Failed to fetch menu items' });
                }

                // Map menu items by ID and attach order count
                const menuMap = new Map(menuRows.map(row => [row.id, row]));
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
            }
        );
    });
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

            db.run("INSERT INTO orders (id, customer, items, total, date, pickupTime, payment_status, payment_method, razorpay_order_id, razorpay_payment_id) VALUES (?,?,?,?,?,?,?,?,?,?)",
                [id, JSON.stringify(customer), JSON.stringify(items), total, confirmedDate, pickupTime, 'PAID', 'Paid Online', razorpay_order_id, razorpay_payment_id], (err) => {
                    if (err) {
                        console.error('[PAYMENT] Order save error after payment:', err);
                        return res.status(500).json({ error: 'Payment verified but failed to save order', details: err.message });
                    }
                    console.log('[PAYMENT] Order saved:', id, 'at', confirmedDate);
                    res.json({
                        success: true,
                        message: 'Payment verified and order created',
                        order: { ...orderData, date: confirmedDate },
                        payment_id: razorpay_payment_id
                    });
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

app.post('/api/chat', (req, res) => {
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
        db.all("SELECT * FROM art_items WHERE status = 'Available'", [], (err, rows) => {
            if (err) return res.json({ reply: "I can't check the gallery right now." });

            if (rows.length === 0) return res.json({ reply: "Currently, all our art pieces are sold out. Check back soon!" });

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
            res.json({ reply: `Here are the available art pieces in our gallery:\n\n${artList}` });
        });
        return;
    }

    // === B. WORKSHOP DOMAIN ===
    if (isWorkshop) {
        db.all("SELECT * FROM workshops", [], (err, rows) => {
            if (err) return res.json({ reply: "I can't check workshops right now." });
            if (rows.length === 0) return res.json({ reply: "No workshops are scheduled at the moment." });

            const workshops = rows.map(w => {
                const available = w.seats - w.booked;
                return `- ${w.title} on ${w.datetime} (₹${w.price})\n  ${available > 0 ? `${available} seats left` : 'SOLD OUT'}`;
            }).join('\n\n');
            res.json({ reply: `Upcoming Workshops:\n\n${workshops}` });
        });
        return;
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

        let query = "SELECT * FROM menu_items WHERE 1=1";
        let params = [];
        let orderBy = "ORDER BY RANDOM()";
        let limit = "LIMIT 3";

        // ENERGY LOGIC (Updates Context IMPLICITLY)
        if (isTired) {
            query += " AND (caffeine = 'Very High' OR caffeine = 'Extreme')";
            activeContext = 'drink';
            limit = "LIMIT 1"; // Give the BEST energy boost
        }

        // FILTERING
        if (activeContext === 'food') {
            query += " AND (category LIKE '%Food%' OR tags LIKE '%food%' OR tags LIKE '%snack%' OR tags LIKE '%meal%')";
        } else if (activeContext === 'drink') {
            query += " AND category NOT LIKE '%Food%'";
            // Subcategory Filtering
            if (subCategory === 'coffee') query += " AND (category LIKE '%Robusta%' OR category LIKE '%Blend%' OR tags LIKE '%coffee%')";
            if (subCategory === 'tea') query += " AND (category LIKE '%Tea%' OR tags LIKE '%tea%')";
            if (subCategory === 'shake') query += " AND (category LIKE '%Shake%' OR tags LIKE '%milk%')";
        }

        // PRICE SORTING
        const isCheapest = msg.includes('cheap') || msg.includes('lowest') || msg.includes('least');
        const isExpensive = msg.includes('expensive') || msg.includes('highest') || msg.includes('most');

        if (isPriceSort) {
            limit = "LIMIT 1";
            if (isCheapest) orderBy = "ORDER BY price ASC";
            else if (isExpensive) orderBy = "ORDER BY price DESC";
        }

        // TASTE / FLAVOR MATCHING
        const flavorKeywords = ['strong', 'sweet', 'cold', 'hot', 'fruity', 'milky', 'creamy', 'chocolate', 'spicy', 'savory'];
        const foundFlavors = flavorKeywords.filter(k => msg.includes(k));
        if (foundFlavors.length > 0) {
            const conditions = foundFlavors.map(() => "tags LIKE ?").join(' OR ');
            query += ` AND (${conditions})`;
            params = foundFlavors.map(k => `%${k}%`);
        }

        const finalSql = `${query} ${orderBy} ${limit}`;

        db.all(finalSql, params, (err, rows) => {
            if (err) return res.json({ reply: "I'm having a brain freeze. Try again?" });

            // UPDATE SESSION MEMORY
            if (sessionId) {
                if (activeContext) sessions[sessionId].lastContext = activeContext;
                if (subCategory) sessions[sessionId].lastCategory = subCategory;
            }

            if (rows.length === 0) {
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
            const item = rows[0];

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
        });
        return;
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
});

initDb().then(async () => {
    // Initialize knowledge index after database is ready
    await initializeKnowledge(db);
    app.listen(PORT, () => { console.log(`🚀 Intelligent Server running on http://localhost:${PORT}`); });
});
