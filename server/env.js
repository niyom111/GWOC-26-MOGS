import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Safely load .env file - try multiple paths
// Priority:
// 1. ../.env (Server directory parent)
// 2. ../../.env (Project root parent - where the user said it is)
// 3. .env (Current working directory)
const possiblePaths = [
    path.join(__dirname, '../.env'),
    path.join(__dirname, '../../.env'),
    path.resolve(process.cwd(), '.env'),
    path.join(process.cwd(), '../.env')
];

let envLoaded = false;
console.log('🔄 initializing environment variables...');

for (const envPath of possiblePaths) {
    const envPathAbsolute = path.resolve(envPath);
    if (fs.existsSync(envPathAbsolute)) {
        console.log('🔍 Found .env file at:', envPathAbsolute);

        const result = dotenv.config({ path: envPathAbsolute });

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
    console.warn('⚠️  .env file not found in any of the expected locations.');
    console.log('   Variables might be loaded from system environment.');
}

export default envLoaded;
