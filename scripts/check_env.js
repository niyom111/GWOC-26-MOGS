
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');

if (!fs.existsSync(envPath)) {
    console.error("❌ ERROR: .env file NOT found at", envPath);
    process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf-8');
const lines = content.split('\n');

const keysToCheck = [
    'VITE_EMAILJS_SERVICE_ID',
    'VITE_EMAILJS_TEMPLATE_ID',
    'VITE_EMAILJS_PUBLIC_KEY'
];

console.log(`Checking .env at ${envPath}...`);
let missing = false;

keysToCheck.forEach(key => {
    const found = lines.some(line => line.trim().startsWith(key + '=') && line.split('=')[1].trim().length > 0);
    if (found) {
        console.log(`✅ Found ${key}`);
    } else {
        console.error(`❌ MISSING or EMPTY: ${key}`);
        missing = true;
    }
});

if (missing) {
    console.log("\n⚠️  Please edit the .env file and add the missing keys.");
} else {
    console.log("\n✅ verifying .env structure looks correct.");
}
