import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { runMigrations } from './migrations/migrate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'rabuste.db');
console.log("--> USING DATABASE AT:", dbPath);
const db = new sqlite3.Database(dbPath);

// Default data (mirrors DataContext.tsx)
const defaultData = {
    menuItems: [
        // Robusta Specialty (Cold - Non-Milk)
        { id: 'rs-cnm-1', name: 'Iced Americano', category: 'Robusta Specialty (Cold - Non Milk)', price: 160, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Robusta Specialty (Cold - Non Milk)', tags: 'cold, strong, black, robusta' },
        { id: 'rs-cnm-2', name: 'Iced Espresso', category: 'Robusta Specialty (Cold - Non Milk)', price: 130, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Robusta Specialty (Cold - Non Milk)', tags: 'cold, strong, black, robusta' },
        { id: 'rs-cnm-3', name: 'Iced Espresso Tonic', category: 'Robusta Specialty (Cold - Non Milk)', price: 250, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Robusta Specialty (Cold - Non Milk)', tags: 'cold, fizzy, refreshing, tonic' },
        { id: 'rs-cnm-4', name: 'Iced Espresso Ginger Ale', category: 'Robusta Specialty (Cold - Non Milk)', price: 250, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Robusta Specialty (Cold - Non Milk)', tags: 'cold, fizzy, refreshing, ginger' },
        { id: 'rs-cnm-5', name: 'Iced Espresso Orange', category: 'Robusta Specialty (Cold - Non Milk)', price: 250, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Robusta Specialty (Cold - Non Milk)', tags: 'cold, fruity, refreshing, orange' },
        { id: 'rs-cnm-6', name: 'Iced Espresso Red Bull', category: 'Robusta Specialty (Cold - Non Milk)', price: 290, caffeine: 'Extreme', image: '/media/pic1.jpeg', description: 'Robusta Specialty (Cold - Non Milk)', tags: 'cold, energy, sweet, strong' },
        { id: 'rs-cnm-7', name: 'Cranberry Tonic', category: 'Robusta Specialty (Cold - Non Milk)', price: 270, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Robusta Specialty (Cold - Non Milk)', tags: 'cold, fruity, sweet, refreshing' },

        // Robusta Specialty (Cold - Milk Based)
        { id: 'rs-cm-1', name: 'Iced Latte', category: 'Robusta Specialty (Cold - Milk Based)', price: 220, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Robusta Specialty (Cold - Milk Based)', tags: 'cold, milky, creamy, classic' },
        { id: 'rs-cm-2', name: 'Affogato', category: 'Robusta Specialty (Cold - Milk Based)', price: 250, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Robusta Specialty (Cold - Milk Based)', tags: 'dessert, ice cream, sweet' },
        { id: 'rs-cm-3', name: 'Classic Frappe', category: 'Robusta Specialty (Cold - Milk Based)', price: 250, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Robusta Specialty (Cold - Milk Based)', tags: 'cold, sweet, blended, creamy' },
        { id: 'rs-cm-4', name: 'Hazelnut', category: 'Robusta Specialty (Cold - Milk Based)', price: 260, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Robusta Specialty (Cold - Milk Based)', tags: 'cold, sweet, nutty' },
        { id: 'rs-cm-5', name: 'Caramel', category: 'Robusta Specialty (Cold - Milk Based)', price: 260, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Robusta Specialty (Cold - Milk Based)', tags: 'cold, sweet, caramel' },
        { id: 'rs-cm-6', name: 'Mocha', category: 'Robusta Specialty (Cold - Milk Based)', price: 270, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Robusta Specialty (Cold - Milk Based)', tags: 'cold, chocolate, sweet' },
        { id: 'rs-cm-7', name: 'Biscoff', category: 'Robusta Specialty (Cold - Milk Based)', price: 270, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Robusta Specialty (Cold - Milk Based)', tags: 'cold, sweet, cookie' },
        { id: 'rs-cm-8', name: 'Vietnamese', category: 'Robusta Specialty (Cold - Milk Based)', price: 240, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Robusta Specialty (Cold - Milk Based)', tags: 'cold, sweet, condensed milk' },
        { id: 'rs-cm-9', name: 'Café Suda', category: 'Robusta Specialty (Cold - Milk Based)', price: 250, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Robusta Specialty (Cold - Milk Based)', tags: 'cold, sweet, strong' },
        { id: 'rs-cm-10', name: 'Robco', category: 'Robusta Specialty (Cold - Milk Based)', price: 290, caffeine: 'Extreme', image: '/media/pic2.jpeg', description: 'Robusta Specialty (Cold - Milk Based)', tags: 'cold, signature' },

        // Robusta Specialty (Hot - Non Milk)
        { id: 'rs-hnm-1', name: 'Robusta Hot Americano', category: 'Robusta Specialty (Hot - Non Milk)', price: 150, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Robusta Specialty (Hot - Non Milk)', tags: 'hot, strong, black, robusta' },
        { id: 'rs-hnm-2', name: 'Robusta Hot Espresso', category: 'Robusta Specialty (Hot - Non Milk)', price: 130, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Robusta Specialty (Hot - Non Milk)', tags: 'hot, strong, black, shot' },

        // Robusta Specialty (Hot - Milk Based)
        { id: 'rs-hm-1', name: 'Robusta Hot Latte', category: 'Robusta Specialty (Hot - Milk Based)', price: 190, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Robusta Specialty (Hot - Milk Based)', tags: 'hot, milky, creamy' },
        { id: 'rs-hm-2', name: 'Robusta Hot Flat White', category: 'Robusta Specialty (Hot - Milk Based)', price: 180, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Robusta Specialty (Hot - Milk Based)', tags: 'hot, milky, strong' },
        { id: 'rs-hm-3', name: 'Robusta Hot Cappuccino', category: 'Robusta Specialty (Hot - Milk Based)', price: 180, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Robusta Specialty (Hot - Milk Based)', tags: 'hot, milky, foamy' },
        { id: 'rs-hm-4', name: 'Robusta Mocha', category: 'Robusta Specialty (Hot - Milk Based)', price: 230, caffeine: 'Extreme', image: '/media/pic3.jpeg', description: 'Robusta Specialty (Hot - Milk Based)', tags: 'hot, chocolate, sweet' },

        // Blend Coffee (Cold - Non Milk)
        { id: 'bl-cnm-1', name: 'Iced Americano', category: 'Blend (Cold - Non Milk)', price: 150, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Blend (Cold - Non Milk)', tags: 'cold, mild, black' },
        { id: 'bl-cnm-2', name: 'Iced Espresso', category: 'Blend (Cold - Non Milk)', price: 120, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Blend (Cold - Non Milk)', tags: 'cold, mild, black' },
        { id: 'bl-cnm-3', name: 'Iced Espresso Tonic', category: 'Blend (Cold - Non Milk)', price: 230, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Blend (Cold - Non Milk)', tags: 'cold, fizzy, refreshing, tonic' },
        { id: 'bl-cnm-4', name: 'Iced Espresso Ginger Ale', category: 'Blend (Cold - Non Milk)', price: 230, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Blend (Cold - Non Milk)', tags: 'cold, fizzy, refreshing, ginger' },
        { id: 'bl-cnm-5', name: 'Iced Espresso Orange', category: 'Blend (Cold - Non Milk)', price: 230, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Blend (Cold - Non Milk)', tags: 'cold, fruity, refreshing, orange' },
        { id: 'bl-cnm-6', name: 'Iced Espresso Red Bull', category: 'Blend (Cold - Non Milk)', price: 270, caffeine: 'Extreme', image: '/media/pic1.jpeg', description: 'Blend (Cold - Non Milk)', tags: 'cold, energy, sweet' },
        { id: 'bl-cnm-7', name: 'Cranberry Tonic', category: 'Blend (Cold - Non Milk)', price: 250, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Blend (Cold - Non Milk)', tags: 'cold, fruity, sweet' },

        // Blend Coffee (Cold - Milk Based)
        { id: 'bl-cm-1', name: 'Iced Latte', category: 'Blend (Cold - Milk Based)', price: 210, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Blend (Cold - Milk Based)', tags: 'cold, milky, creamy' },
        { id: 'bl-cm-2', name: 'Affogato', category: 'Blend (Cold - Milk Based)', price: 240, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Blend (Cold - Milk Based)', tags: 'dessert, ice cream, sweet' },
        { id: 'bl-cm-3', name: 'Classic Frappe', category: 'Blend (Cold - Milk Based)', price: 240, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Blend (Cold - Milk Based)', tags: 'cold, sweet, blended' },
        { id: 'bl-cm-4', name: 'Hazelnut', category: 'Blend (Cold - Milk Based)', price: 250, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Blend (Cold - Milk Based)', tags: 'cold, sweet, nutty' },
        { id: 'bl-cm-5', name: 'Caramel', category: 'Blend (Cold - Milk Based)', price: 250, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Blend (Cold - Milk Based)', tags: 'cold, sweet, caramel' },
        { id: 'bl-cm-6', name: 'Mocha', category: 'Blend (Cold - Milk Based)', price: 260, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Blend (Cold - Milk Based)', tags: 'cold, chocolate, sweet' },
        { id: 'bl-cm-7', name: 'Biscoff', category: 'Blend (Cold - Milk Based)', price: 260, caffeine: 'High', image: '/media/pic2.jpeg', description: 'Blend (Cold - Milk Based)', tags: 'cold, sweet, cookie' },

        // Blend Coffee (Hot - Non Milk)
        { id: 'bl-hnm-1', name: 'Hot Americano', category: 'Blend (Hot - Non Milk)', price: 140, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Blend (Hot - Non Milk)', tags: 'hot, mild, black' },
        { id: 'bl-hnm-2', name: 'Hot Espresso', category: 'Blend (Hot - Non Milk)', price: 120, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Blend (Hot - Non Milk)', tags: 'hot, mild, black, shot' },

        // Blend Coffee (Hot - Milk Based)
        { id: 'bl-hm-1', name: 'Hot Latte', category: 'Blend (Hot - Milk Based)', price: 180, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Blend (Hot - Milk Based)', tags: 'hot, milky, creamy' },
        { id: 'bl-hm-2', name: 'Hot Flat White', category: 'Blend (Hot - Milk Based)', price: 170, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Blend (Hot - Milk Based)', tags: 'hot, milky, mild' },
        { id: 'bl-hm-3', name: 'Hot Cappuccino', category: 'Blend (Hot - Milk Based)', price: 170, caffeine: 'High', image: '/media/pic3.jpeg', description: 'Blend (Hot - Milk Based)', tags: 'hot, milky, foamy' },
        { id: 'bl-hm-4', name: 'Mocha', category: 'Blend (Hot - Milk Based)', price: 220, caffeine: 'Extreme', image: '/media/pic3.jpeg', description: 'Blend (Hot - Milk Based)', tags: 'hot, chocolate, sweet' },

        // Manual Brew (Robusta - Peaberry Special)
        { id: 'mb-1', name: 'Classic Cold Brew', category: 'Manual Brew (Peaberry Special)', price: 220, caffeine: 'Very High', image: '/media/pic1.jpeg', description: 'Manual Brew (Peaberry Special)', tags: 'cold, strong, smooth' },
        { id: 'mb-2', name: 'Cold Brew Tonic', category: 'Manual Brew (Peaberry Special)', price: 270, caffeine: 'Very High', image: '/media/pic1.jpeg', description: 'Manual Brew (Peaberry Special)', tags: 'cold, fizzy, refreshing' },
        { id: 'mb-3', name: 'Cold Brew Ginger Ale', category: 'Manual Brew (Peaberry Special)', price: 270, caffeine: 'Very High', image: '/media/pic1.jpeg', description: 'Manual Brew (Peaberry Special)', tags: 'cold, fizzy, refreshing' },
        { id: 'mb-4', name: 'Cold Brew Orange', category: 'Manual Brew (Peaberry Special)', price: 270, caffeine: 'Very High', image: '/media/pic1.jpeg', description: 'Manual Brew (Peaberry Special)', tags: 'cold, fruity, refreshing' },
        { id: 'mb-5', name: 'Cold Brew Red Bull', category: 'Manual Brew (Peaberry Special)', price: 290, caffeine: 'Extreme', image: '/media/pic1.jpeg', description: 'Manual Brew (Peaberry Special)', tags: 'cold, energy, sweet' },
        { id: 'mb-6', name: 'V60 Pour Over Hot', category: 'Manual Brew (Peaberry Special)', price: 220, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Manual Brew (Peaberry Special)', tags: 'hot, black, artisan' },
        { id: 'mb-7', name: 'V60 Pour Over Cold', category: 'Manual Brew (Peaberry Special)', price: 230, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Manual Brew (Peaberry Special)', tags: 'cold, black, artisan' },
        { id: 'mb-8', name: 'Cranberry Cold Brew Tonic', category: 'Manual Brew (Peaberry Special)', price: 280, caffeine: 'High', image: '/media/pic1.jpeg', description: 'Manual Brew (Peaberry Special)', tags: 'cold, fruity, sweet' },

        // Shakes
        { id: 'sh-1', name: 'Chocolate', category: 'Shakes', price: 220, caffeine: 'Low', image: '/media/pic2.jpeg', description: 'Shakes', tags: 'cold, dessert, sweet, milk, chocolate' },
        { id: 'sh-2', name: 'Biscoff', category: 'Shakes', price: 250, caffeine: 'Low', image: '/media/pic2.jpeg', description: 'Shakes', tags: 'cold, dessert, sweet, milk, cookie' },
        { id: 'sh-3', name: 'Nutella', category: 'Shakes', price: 260, caffeine: 'Low', image: '/media/pic2.jpeg', description: 'Shakes', tags: 'cold, dessert, sweet, milk, chocolate' },

        // Tea (Cold)
        { id: 'tea-1', name: 'Lemon Ice Tea', category: 'Tea (Cold)', price: 210, caffeine: 'Medium', image: '/media/pic3.jpeg', description: 'Tea (Cold)', tags: 'cold, sweet, refreshing, tea' },
        { id: 'tea-2', name: 'Peach Ice Tea', category: 'Tea (Cold)', price: 210, caffeine: 'Medium', image: '/media/pic3.jpeg', description: 'Tea (Cold)', tags: 'cold, sweet, refreshing, tea' },
        { id: 'tea-3', name: 'Ginger Fizz', category: 'Tea (Cold)', price: 250, caffeine: 'Low', image: '/media/pic3.jpeg', description: 'Tea (Cold)', tags: 'cold, spicy, refreshing' },
        { id: 'tea-4', name: 'Classic Orange Mint', category: 'Tea (Cold)', price: 250, caffeine: 'Low', image: '/media/pic3.jpeg', description: 'Tea (Cold)', tags: 'cold, citrus, fresh' },

        // Food
        { id: 'fd-1', name: 'Fries', category: 'Food', price: 150, caffeine: 'None', image: '/media/pic1.jpeg', description: 'Food', tags: 'food, snack, salty' },
        { id: 'fd-2', name: 'Potato Wedges', category: 'Food', price: 170, caffeine: 'None', image: '/media/pic1.jpeg', description: 'Food', tags: 'food, snack, salty' },
        { id: 'fd-3', name: 'Veg Nuggets', category: 'Food', price: 190, caffeine: 'None', image: '/media/pic1.jpeg', description: 'Food', tags: 'food, snack, savory' },
        { id: 'fd-4', name: 'Pizza', category: 'Food', price: 300, caffeine: 'None', image: '/media/pic1.jpeg', description: 'Food', tags: 'food, meal, cheesy' },
        { id: 'fd-5', name: 'Bagel', category: 'Food', price: 100, caffeine: 'None', image: '/media/pic1.jpeg', description: 'Food', tags: 'food, bread, breakfast' },
        { id: 'fd-6', name: 'Cream Cheese Bagel', category: 'Food', price: 150, caffeine: 'None', image: '/media/pic1.jpeg', description: 'Food', tags: 'food, bread, creamy' },
        { id: 'fd-7', name: 'Jalapeno Cheese Bagel', category: 'Food', price: 200, caffeine: 'None', image: '/media/pic1.jpeg', description: 'Food', tags: 'food, spicy, savory' },
        { id: 'fd-8', name: 'Pesto Bagel', category: 'Food', price: 230, caffeine: 'None', image: '/media/pic1.jpeg', description: 'Food', tags: 'food, savory, herbal' },
        { id: 'fd-9', name: 'Butter Croissant', category: 'Food', price: 150, caffeine: 'None', image: '/media/pic1.jpeg', description: 'Food', tags: 'food, pastry, buttery' },
        { id: 'fd-10', name: 'Nutella Croissant', category: 'Food', price: 200, caffeine: 'None', image: '/media/pic1.jpeg', description: 'Food', tags: 'food, pastry, sweet' },
        { id: 'fd-11', name: 'Cream Cheese Croissant', category: 'Food', price: 240, caffeine: 'None', image: '/media/pic1.jpeg', description: 'Food', tags: 'food, pastry, savory' }
    ],
    artItems: [], // Cleared as requested

    workshops: [
        { id: 'w1', title: 'Latte Art Basics', datetime: 'Oct 24, 10:00 AM', seats: 8, booked: 5, price: 0 },
        { id: 'w2', title: 'The Robusta Brew Lab', datetime: 'Nov 02, 8:00 AM', seats: 10, booked: 7, price: 799 },
    ]
};

export async function initDb() {
    // Run migrations first to ensure schema is up to date
    try {
        console.log("Running database migrations...");
        await runMigrations();
    } catch (error) {
        console.error("Migration failed:", error);
        throw error;
    }

    // Then seed data if needed
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // SEED DATA
            db.get("SELECT count(*) as count FROM menu_items", (err, row) => {
                if (!err && row.count === 0) {
                    console.log("Seeding Menu Items...");
                    // Explicitly list columns so new nullable columns take their defaults/NULL
                    const stmt = db.prepare("INSERT INTO menu_items (id, name, category, price, caffeine, image, description, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                    defaultData.menuItems.forEach(item => {
                        stmt.run(item.id, item.name, item.category, item.price, item.caffeine, item.image, item.description, item.tags || '');
                    });
                    stmt.finalize();
                }
            });

            // FIXED: Only seed Art items if the table is completely empty.
            // This prevents deleted items from reappearing on server restart.
            // FIXED: Only seed Art items if the table is completely empty.
            // This prevents deleted items from reappearing on server restart.
            /*
            db.get("SELECT count(*) as count FROM art_items", (err, row) => {
                if (!err && row.count === 0) {
                    console.log("Seeding Art Items...");
                    const stmt = db.prepare("INSERT INTO art_items (id, title, artist, price, status, image, stock) VALUES (?, ?, ?, ?, ?, ?, ?)");
                    defaultData.artItems.forEach(item => {
                        stmt.run(item.id, item.title, item.artist, item.price, item.status, item.image, item.stock || 1);
                    });
                    stmt.finalize();
                }
            });
            */

            db.get("SELECT count(*) as count FROM workshops", (err, row) => {
                if (!err && row.count === 0) {
                    console.log("Seeding Workshops...");
                    const stmt = db.prepare("INSERT INTO workshops VALUES (?, ?, ?, ?, ?, ?)");
                    defaultData.workshops.forEach(item => {
                        stmt.run(item.id, item.title, item.datetime, item.seats, item.booked, item.price);
                    });
                    stmt.finalize();
                    console.log("Database initialized.");
                }
                resolve();
            });
        });
    });
}

export { db };
