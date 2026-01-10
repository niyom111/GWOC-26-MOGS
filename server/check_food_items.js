
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkFood() {
    const { data: allItems } = await supabase.from('menu_items').select('name, category, price');
    console.log("Total Items:", allItems.length);

    const nuggets = allItems.filter(i => i.name.toLowerCase().includes('nugget'));
    console.log("Nugget matches:", nuggets);

    const food = allItems.filter(i => !i.category.toLowerCase().includes('coffee') && !i.category.toLowerCase().includes('drink'));
    console.log("Other Food examples:", food.slice(0, 5).map(f => f.name));
}

checkFood();
