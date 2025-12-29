import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { db, initDb } from './db.js';
import { initializeKnowledge, rebuildKnowledgeIndex, getFuseKnowledge } from './data/knowledgeManager.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

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

// -----------------------------------------------------
// STANDARD API ROUTES
// -----------------------------------------------------
// (Keeping CRUD routes concise as requested by context, but fully functional in file)

app.get('/api/menu', (req, res) => {
    db.all("SELECT * FROM menu_items", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});
app.post('/api/menu', (req, res) => {
    const { id, name, category, price, caffeine, image, description, tags } = req.body;
    db.run("INSERT INTO menu_items (id, name, category, price, caffeine, image, description, tags) VALUES (?,?,?,?,?,?,?,?)",
        [id, name, category, price, caffeine, image, description, tags], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id, ...req.body });
            // Rebuild knowledge index after adding menu item
            rebuildKnowledgeIndex(db).catch(err => console.error('Error rebuilding knowledge after menu POST:', err));
        });
});
app.put('/api/menu/:id', (req, res) => {
    const { name, category, price, caffeine, image, description, tags } = req.body;
    let sql = "UPDATE menu_items SET ";
    const params = [];

    // Dynamically build query to prevent overwriting with null
    if (name !== undefined) { sql += "name = ?, "; params.push(name); }
    if (category !== undefined) { sql += "category = ?, "; params.push(category); }
    if (price !== undefined) { sql += "price = ?, "; params.push(price); }
    if (caffeine !== undefined) { sql += "caffeine = ?, "; params.push(caffeine); }
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
    const { id, title, price, status, image, stock } = req.body;
    // 'artist' column still exists in DB, so we pass an empty string or default value
    const artist = "";
    db.run("INSERT INTO art_items (id, title, artist, price, status, image, stock) VALUES (?,?,?,?,?,?,?)",
        [id, title, artist, price, status, image, stock || 1], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(req.body);
            // Rebuild knowledge index after adding art item
            rebuildKnowledgeIndex(db).catch(err => console.error('Error rebuilding knowledge after art POST:', err));
        });
});
app.put('/api/art/:id', (req, res) => {
    const { title, artist, status, price, image, stock } = req.body;
    let sql = "UPDATE art_items SET ";
    const params = [];

    if (title !== undefined) { sql += "title = ?, "; params.push(title); }
    if (artist !== undefined) { sql += "artist = ?, "; params.push(artist); }
    if (status !== undefined) { sql += "status = ?, "; params.push(status); }
    if (price !== undefined) { sql += "price = ?, "; params.push(price); }
    if (image !== undefined) { sql += "image = ?, "; params.push(image); }
    if (stock !== undefined) { sql += "stock = ?, "; params.push(stock); }

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
    const { id, customer, items, total, date, pickupTime } = req.body;
    db.run("INSERT INTO orders (id, customer, items, total, date, pickupTime) VALUES (?,?,?,?,?,?)",
        [id, JSON.stringify(customer), JSON.stringify(items), total, date, pickupTime], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(req.body);
        });
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

                return res.json({ reply: `For art, I recommend **"${winner.title}"** by ${winner.artist} (₹${winner.price}). It's a stunning piece.` });
            }

            // General List
            const artList = rows.map(a => `- "${a.title}" by ${a.artist} (₹${a.price})`).join('\n');
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
