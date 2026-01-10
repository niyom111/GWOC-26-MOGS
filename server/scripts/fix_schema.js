import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
// Start with a default connection string if not found, though it likely won't work without password
// Ideally SUPABASE_DB_URL should be in env, or we construct it.
// For Supabase, the connection string is usually: postgres://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
// Since we don't have the password easily accessible in the env vars usually (unless explicitly set), 
// we might have a problem if we can't use the service key with REST API to run SQL.
// Standard Supabase JS client doesn't support running arbitrary SQL for security.
// 
// HOWEVER, let's look at how the app connects. It uses `createClient`.
// The only way to modify schema is:
// 1. Dashboard (Manual) - User didn't ask for this.
// 2. SQL Editor (Manual) - User didn't ask for this.
// 3. Direct Postgres Connection (requires connection string with password)
// 4. Supabase Management API (requires access token)
//
// Let's assume the user has a DATABASE_URL in their .env for direct DB access, 
// OR try to parse it if available. 
// If not available, we might have to ask the user or fail gracefully.
//
// BUT WAIT! The user provided `migrations` folder suggests they might have a way to run them?
// Ah, `migrate.js` uses `sqlite3`. The user is running locally with SQLite?
//
// Let's RE-READ `server/db.js` carefully.
//
// `import { createClient } from '@supabase/supabase-js';`
// It connects to Supabase Url.
//
// BUT `server/migrate.js` imports `sqlite3`.
//
// Is the app using SQLite or Supabase?
// `server/index.js` imports `{ db }` from `./db.js`.
// `server/db.js` exports `supabase` as `db`.
//
// So the APP relies on Supabase.
//
// The `migrate.js` script seems to be a leftover or for a local-only version?
// OR maybe the user IS using SQLite locally and I missed it?
//
// Let's check `server/db.js` again.
// It checks validation: `if (!supabaseUrl || !supabaseAnonKey) ... throw new Error('Supabase credentials missing');`
// So it DEFINITELY uses Supabase.
//
// The `migrate.js` file existing with SQLite is extremely confusing. 
// Maybe the user INTENDS to use SQLite but hasn't switched `db.js`?
// OR `migrate.js` is just wrong/legacy.
//
// Implication: Use `pg` to connect to `process.env.DATABASE_URL`.
// If `DATABASE_URL` is missing, we are stuck.
//
// Let's look at `.env` content (I can't read it directly for security, but I can check if variables exist via a script).
//
// I will try to read `DATABASE_URL` in this script.

async function applyFix() {
    console.log("Checking for DATABASE_URL...");
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error("❌ DATABASE_URL not found in .env. Cannot connect to Postgres directly to run migrations.");
        console.error("Please add DATABASE_URL=postgres://user:password@host:port/dbname to your .env file.");
        process.exit(1);
    }

    console.log("Connecting to Postgres...");
    const client = new pg.Client({
        connectionString,
        ssl: { rejectUnauthorized: false } // Required for Supabase in many cases
    });

    try {
        await client.connect();
        console.log("Connected.");

        const migrationFile = path.join(__dirname, '../migrations/008_add_updated_at.sql');
        const sql = fs.readFileSync(migrationFile, 'utf8');

        console.log("Applying migration 008...");

        // Simple split by ; isn't perfect but works for simple migrations
        const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));

        for (const stmt of statements) {
            console.log("Running:", stmt.substring(0, 50) + "...");
            await client.query(stmt);
        }

        console.log("✅ Migration applied successfully.");

    } catch (err) {
        console.error("❌ Migration failed:", err);
    } finally {
        await client.end();
    }
}

applyFix();
