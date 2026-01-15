
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMenu() {
    const { data, error } = await supabase.from('menu_items').select('name, category, price, caffeine_mg');
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Found", data.length, "items:");
        data.forEach(x => console.log(`- [${x.category}] ${x.name} ($${x.price}) (Caffeine: ${x.caffeine_mg})`));
    }
}

checkMenu();
