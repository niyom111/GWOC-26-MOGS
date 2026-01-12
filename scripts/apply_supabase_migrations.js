
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const { Client } = pg;

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env'); // Root .env

dotenv.config({ path: envPath });

const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL; // Try common names

if (!dbUrl) {
    console.error('❌ Error: DATABASE_URL not found in .env. Cannot run migrations against Supabase.');
    console.log('Please ensure your .env has a valid PostgreSQL connection string (DATABASE_URL).');
    // Fallback: Try to construct it if we have other vars (unlikely to work for transaction pooler mode but okay for direct)
    process.exit(1);
}

const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false } // Required for Supabase usually
});

async function runMigrations() {
    try {
        await client.connect();
        console.log('✅ Connected to Database');

        // 006
        console.log('Applying 006_franchise_tables.sql...');
        const path006 = path.join(__dirname, '../server/migrations/006_franchise_tables.sql');
        if (fs.existsSync(path006)) {
            const sql006 = fs.readFileSync(path006, 'utf8');
            // Split by simple ; for basic support, or run whole block if it supports it
            // pg client can run multiple statements usually
            await client.query(sql006);
            console.log('✓ 006 Applied');
        } else {
            console.error('❌ 006 not found');
        }

        // 007
        console.log('Applying 007_franchise_status_update.sql...');
        const path007 = path.join(__dirname, '../server/migrations/007_franchise_status_update.sql');
        if (fs.existsSync(path007)) {
            const sql007 = fs.readFileSync(path007, 'utf8');
            await client.query(sql007);
            console.log('✓ 007 Applied');
        } else {
            console.error('❌ 007 not found');
        }

        // 008
        console.log('Applying 008_add_updated_at.sql...');
        const path008 = path.join(__dirname, '../server/migrations/008_add_updated_at.sql');
        if (fs.existsSync(path008)) {
            const sql008 = fs.readFileSync(path008, 'utf8');
            await client.query(sql008);
            console.log('✓ 008 Applied');
        } else {
            console.error('❌ 008 not found');
        }

        console.log('✅ All migrations applied.');

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigrations();
