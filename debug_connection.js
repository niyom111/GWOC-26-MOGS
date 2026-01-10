
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
const possiblePaths = [
    path.join(__dirname, '.env'),
    path.join(__dirname, 'server/.env'), // Adjust based on where this script is run
];

for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
        console.log(`Loading .env from: ${envPath}`);
        dotenv.config({ path: envPath });
        break;
    }
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY");
    process.exit(1);
}

console.log(`\nChecking Connection...`);
console.log(`URL: ${url}`);
console.log(`Key: ${key.substring(0, 10)}...`);

const supabase = createClient(url, key);

async function checkColumn() {
    console.log("\nAttempting to SELECT 'status' column from 'franchise_enquiries'...");
    const { data, error } = await supabase
        .from('franchise_enquiries')
        .select('status')
        .limit(1);

    if (error) {
        console.error("❌ ERROR: API cannot see the 'status' column.");
        console.error("   Details:", error.message);
        console.error("   Hint: This confirms the API Schema Cache is stale or you are on the wrong DB.");
    } else {
        console.log("✅ SUCCESS: API can see the 'status' column!");
        console.log("   Rows returned:", data.length);
    }
}

checkColumn();
