
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../server/rabuste.db');
const db = new sqlite3.Database(dbPath);

console.log("--- RESETTING DATABASE ---");

db.serialize(() => {
    // 1. Clear Orders (History)
    db.run("DELETE FROM orders", (err) => {
        if (err) console.error("Error clearing orders:", err);
        else console.log("✅ Orders cleared.");
    });

    // 2. Clear Art Items
    db.run("DELETE FROM art_items", (err) => {
        if (err) console.error("Error clearing art:", err);
        else console.log("✅ Art items cleared.");
    });

    // 3. Clear Menu Items (To force re-seed on restart)
    db.run("DELETE FROM menu_items", (err) => {
        if (err) console.error("Error clearing menu:", err);
        else console.log("✅ Menu items cleared (will re-seed on restart).");
    });
});

setTimeout(() => {
    db.close();
    console.log("--- RESET COMPLETE ---");
}, 1000);
