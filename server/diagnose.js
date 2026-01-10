
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log("--- ENV DIAGNOSTIC ---");
const keys = [
    'GEMINI_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'PORT'
];

keys.forEach(k => {
    const val = process.env[k];
    if (!val) console.log(`❌ ${k}: MISSING`);
    else console.log(`✅ ${k}: Present (${val.length} chars)`);
});
console.log("----------------------");

async function pingServer() {
    try {
        // Try to fetch menu to test Supabase
        console.log("Testing Supabase via API...");
        // Assumes server is running at localhost:5000 (default)
        // We can't fetch strictly from here if the server isn't running in this process, 
        // but the user said "restored", implying they might have restarted or are trying to.
        // Actually best to just check the keys first.

        // Let's try to query chat API if server is up
        const res = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "Hello", context: {} })
        });
        const data = await res.json();
        console.log("Server Response:", JSON.stringify(data));
    } catch (e) {
        console.log("Server Ping Failed (Server might be down):", e.message);
    }
}

pingServer();
