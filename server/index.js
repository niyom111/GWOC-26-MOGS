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
        const { data, error } = await db.from('menu_items')
            .select(`
                *,
                categories (name),
                sub_categories (name),
                menu_item_tags (
                    tags (id, name)
                )
            `);
        if (error) return res.status(500).json({ error: error.message });

        // Map data to flattened structure expected by frontend
        const mappedData = (data || []).map(item => {
            // Resolve Category Name: joined -> legacy -> existing field
            const categoryName = item.categories?.name || item.category_legacy || item.category || '';

            // Resolve Sub-Category Name
            const subCategoryName = item.sub_categories?.name || '';

            // Resolve Tags
            let resolvedTags = [];
            if (item.menu_item_tags && Array.isArray(item.menu_item_tags)) {
                resolvedTags = item.menu_item_tags
                    .map(mt => mt.tags)
                    .filter(t => t);
            }
            // Fallback to legacy CSV tags if needed
            if (resolvedTags.length === 0 && item.tags && typeof item.tags === 'string') {
                resolvedTags = item.tags.split(',').map((t, i) => ({ id: `legacy-${i}`, name: t.trim() }));
            }

            return {
                ...item,
                category: categoryName,
                sub_category: subCategoryName,
                tags: resolvedTags
            };
        });

        res.json(mappedData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/menu', async (req, res) => {
    try {
        console.log('POST /api/menu body:', req.body);
        const {
            id,
            name,
            category,          // Legacy field (will be stored in category_legacy)
            category_id,       // New FK field
            sub_category_id,   // New FK field
            price,
            caffeine,
            caffeine_mg,
            calories,
            shareable,
            intensity_level,
            image,
            description,
            tag_ids,           // Array of tag UUIDs for the join table
        } = req.body;

        const insertData = {
            id,
            name,
            price,
            caffeine,
            caffeine_mg: caffeine_mg ?? null,
            calories: calories ?? null,
            shareable: shareable ?? null,
            intensity_level: intensity_level ?? null,
            image,
            description,
        };

        // Support both old and new schema
        if (category_id) {
            insertData.category_id = category_id;
        }
        if (sub_category_id) {
            insertData.sub_category_id = sub_category_id;
        }
        // Legacy support: if category string is provided but not category_id
        if (category && !category_id) {
            insertData.category_legacy = category;
        }

        // Fix for NOT NULL constraint on category_legacy
        // If we have category_id but no category_legacy, fetch the name to satisfy the constraint
        if (!insertData.category_legacy && category_id) {
            const { data: catData } = await db.from('categories')
                .select('name')
                .eq('id', category_id)
                .single();
            if (catData) {
                insertData.category_legacy = catData.name;
            } else {
                insertData.category_legacy = 'Uncategorized';
            }
        } else if (!insertData.category_legacy) {
            // Fallback if no category info provided
            insertData.category_legacy = 'Uncategorized';
        }

        const { data, error } = await db.from('menu_items')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            console.error('Supabase Insert Error:', error);
            return res.status(500).json({ error: error.message });
        }

        // Handle tags via join table
        if (tag_ids && Array.isArray(tag_ids) && tag_ids.length > 0) {
            const tagInserts = tag_ids.map(tag_id => ({
                menu_item_id: id,
                tag_id
            }));
            const { error: tagError } = await db.from('menu_item_tags').insert(tagInserts);
            if (tagError) console.error('Tag Insert Error:', tagError);
        }

        res.json({ id, ...req.body });
        // Rebuild knowledge index after adding menu item
        rebuildKnowledgeIndex(db).catch(err => console.error('Error rebuilding knowledge after menu POST:', err));
    } catch (error) {
        console.error('Error in POST /api/menu:', error);
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/menu/:id', async (req, res) => {
    try {
        const {
            name,
            category,          // Legacy field
            category_id,       // New FK field
            sub_category_id,   // New FK field
            price,
            caffeine,
            caffeine_mg,
            calories,
            shareable,
            intensity_level,
            image,
            description,
            tag_ids,           // Array of tag UUIDs
        } = req.body;

        // Build update object with only defined fields
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (price !== undefined) updateData.price = price;
        if (caffeine !== undefined) updateData.caffeine = caffeine;
        if (caffeine_mg !== undefined) updateData.caffeine_mg = caffeine_mg;
        if (calories !== undefined) updateData.calories = calories;
        if (shareable !== undefined) updateData.shareable = shareable;
        if (intensity_level !== undefined) updateData.intensity_level = intensity_level;
        if (image !== undefined) updateData.image = image;
        if (description !== undefined) updateData.description = description;

        // Handle new FK fields
        if (category_id !== undefined) updateData.category_id = category_id;
        if (sub_category_id !== undefined) updateData.sub_category_id = sub_category_id;
        // Legacy support
        if (category !== undefined && category_id === undefined) {
            updateData.category_legacy = category;
        }

        const { error } = await db.from('menu_items')
            .update(updateData)
            .eq('id', req.params.id);

        if (error) return res.status(500).json({ error: error.message });

        // Handle tag updates via join table if provided
        if (tag_ids !== undefined && Array.isArray(tag_ids)) {
            // Delete existing tags
            await db.from('menu_item_tags').delete().eq('menu_item_id', req.params.id);
            // Insert new tags
            if (tag_ids.length > 0) {
                const tagInserts = tag_ids.map(tag_id => ({
                    menu_item_id: req.params.id,
                    tag_id
                }));
                await db.from('menu_item_tags').insert(tagInserts);
            }
        }

        res.json({ message: "Updated" });
        // Rebuild knowledge index after updating menu item
        rebuildKnowledgeIndex(db).catch(err => console.error('Error rebuilding knowledge after menu PUT:', err));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.delete('/api/menu/:id', async (req, res) => {
    try {
        // Also delete from menu_item_tags join table first
        await db.from('menu_item_tags').delete().eq('menu_item_id', req.params.id);

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

// -----------------------------------------------------
// CATEGORIES API
// -----------------------------------------------------

app.get('/api/categories', async (req, res) => {
    try {
        const { data, error } = await db.from('categories').select('*').order('name');
        if (error) return res.status(500).json({ error: error.message });
        res.json(data || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/categories', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const { data, error } = await db.from('categories')
            .insert({ name: name.trim().toUpperCase() })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation
                return res.status(409).json({ error: 'Category already exists' });
            }
            return res.status(500).json({ error: error.message });
        }
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rename category
app.put('/api/categories/:id', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const normalizedName = name.trim().toUpperCase();

        // Check for duplicate name (excluding current category)
        const { data: existing } = await db.from('categories')
            .select('id')
            .eq('name', normalizedName)
            .neq('id', req.params.id)
            .single();

        if (existing) {
            return res.status(409).json({ error: 'Category already exists' });
        }

        const { data, error } = await db.from('categories')
            .update({ name: normalizedName })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete category with dependency check
app.delete('/api/categories/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;

        // Check for sub-categories
        const { data: subCats } = await db.from('sub_categories')
            .select('id')
            .eq('category_id', categoryId)
            .limit(1);

        if (subCats && subCats.length > 0) {
            return res.status(409).json({
                error: 'Cannot delete category: has sub-categories',
                type: 'HAS_SUBCATEGORIES'
            });
        }

        // Check for menu items using this category
        const { data: menuItems } = await db.from('menu_items')
            .select('id')
            .eq('category_id', categoryId)
            .limit(1);

        if (menuItems && menuItems.length > 0) {
            return res.status(409).json({
                error: 'Cannot delete category: has menu items',
                type: 'HAS_ITEMS'
            });
        }

        const { error } = await db.from('categories').delete().eq('id', categoryId);
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// -----------------------------------------------------
// SUB-CATEGORIES API
// -----------------------------------------------------

app.get('/api/sub-categories', async (req, res) => {
    try {
        const { category_id } = req.query;
        let query = db.from('sub_categories').select('*').order('name');

        if (category_id) {
            query = query.eq('category_id', category_id);
        }

        const { data, error } = await query;
        if (error) return res.status(500).json({ error: error.message });
        res.json(data || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/sub-categories', async (req, res) => {
    try {
        const { category_id, name } = req.body;
        if (!category_id || !name || !name.trim()) {
            return res.status(400).json({ error: 'category_id and name are required' });
        }

        const { data, error } = await db.from('sub_categories')
            .insert({ category_id, name: name.trim() })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation
                return res.status(409).json({ error: 'Sub-category already exists for this category' });
            }
            return res.status(500).json({ error: error.message });
        }
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rename sub-category
app.put('/api/sub-categories/:id', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Sub-category name is required' });
        }

        // Get current sub-category to know its category_id
        const { data: current } = await db.from('sub_categories')
            .select('category_id')
            .eq('id', req.params.id)
            .single();

        if (!current) {
            return res.status(404).json({ error: 'Sub-category not found' });
        }

        const normalizedName = name.trim();

        // Check for duplicate name within the same category
        const { data: existing } = await db.from('sub_categories')
            .select('id')
            .eq('category_id', current.category_id)
            .eq('name', normalizedName)
            .neq('id', req.params.id)
            .single();

        if (existing) {
            return res.status(409).json({ error: 'Sub-category already exists in this category' });
        }

        const { data, error } = await db.from('sub_categories')
            .update({ name: normalizedName })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete sub-category with dependency check
app.delete('/api/sub-categories/:id', async (req, res) => {
    try {
        const subCategoryId = req.params.id;

        // Check for menu items using this sub-category
        const { data: menuItems } = await db.from('menu_items')
            .select('id')
            .eq('sub_category_id', subCategoryId)
            .limit(1);

        if (menuItems && menuItems.length > 0) {
            return res.status(409).json({
                error: 'Cannot delete sub-category: has menu items',
                type: 'HAS_ITEMS'
            });
        }

        const { error } = await db.from('sub_categories').delete().eq('id', subCategoryId);
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// -----------------------------------------------------
// TAGS API
// -----------------------------------------------------

app.get('/api/tags', async (req, res) => {
    try {
        const { data, error } = await db.from('tags').select('*').order('name');
        if (error) return res.status(500).json({ error: error.message });
        res.json(data || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/tags', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Tag name is required' });
        }

        const normalizedName = name.trim().toLowerCase();

        const { data, error } = await db.from('tags')
            .insert({ name: normalizedName })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation
                // Return existing tag instead of error
                const { data: existing } = await db.from('tags')
                    .select('*')
                    .eq('name', normalizedName)
                    .single();
                return res.json(existing);
            }
            return res.status(500).json({ error: error.message });
        }
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/tags/:id', async (req, res) => {
    try {
        const { error } = await db.from('tags').delete().eq('id', req.params.id);
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// -----------------------------------------------------
// MENU ITEM TAGS (Many-to-Many)
// -----------------------------------------------------

// Get tags for a specific menu item
app.get('/api/menu/:id/tags', async (req, res) => {
    try {
        const { data, error } = await db.from('menu_item_tags')
            .select('tag_id, tags(id, name)')
            .eq('menu_item_id', req.params.id);

        if (error) return res.status(500).json({ error: error.message });

        // Flatten the response to just tag objects
        const tags = (data || []).map(row => row.tags).filter(Boolean);
        res.json(tags);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sync tags for a menu item (replace all)
app.put('/api/menu/:id/tags', async (req, res) => {
    try {
        const { tag_ids } = req.body; // Array of tag UUIDs
        const menuItemId = req.params.id;

        if (!Array.isArray(tag_ids)) {
            return res.status(400).json({ error: 'tag_ids must be an array' });
        }

        // Delete existing tags
        await db.from('menu_item_tags').delete().eq('menu_item_id', menuItemId);

        // Insert new tags
        if (tag_ids.length > 0) {
            const inserts = tag_ids.map(tag_id => ({
                menu_item_id: menuItemId,
                tag_id
            }));

            const { error } = await db.from('menu_item_tags').insert(inserts);
            if (error) return res.status(500).json({ error: error.message });
        }

        res.json({ message: 'Tags updated' });
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
