
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the DB file in the server directory
const dbPath = join(__dirname, '../server/rabuste.db');
console.log("Checking Database at:", dbPath);

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
        process.exit(1);
    }
    console.log("Successfully connected to SQLite database on disk.");
});

async function verifyDiskData() {
    console.log("\n--- VERIFYING ART ITEMS ---");
    db.all("SELECT * FROM art_items", [], (err, rows) => {
        if (err) console.error("Error reading art_items:", err);
        else {
            console.log(`Found ${rows.length} art items on disk.`);
            if (rows.length > 0) {
                console.log("Sample Item:", rows[0]);
            }
        }
    });

    console.log("\n--- VERIFYING ORDERS ---");
    db.all("SELECT * FROM orders", [], (err, rows) => {
        if (err) console.error("Error reading orders:", err);
        else {
            console.log(`Found ${rows.length} orders on disk.`);
            if (rows.length > 0) {
                console.log("Sample Order:", rows[0]);
            }
        }
    });

    // Clean exit after a delay
    setTimeout(() => {
        db.close();
    }, 2000);
}

verifyDiskData();
