import { supabaseAdmin } from './supabaseClient.js';

export async function getSystemPrompt() {
  try {
    // 1. Fetch Live Menu
    const { data: menuItems } = await supabaseAdmin
      .from('menu_items')
      .select('name, price, category, intensity_level, description');

    // 2. Fetch Live Art
    const { data: artItems } = await supabaseAdmin
      .from('art_items')
      .select('title, artist, price, status')
      .eq('status', 'Available');

    // 3. Fetch Live Workshops
    const { data: workshops } = await supabaseAdmin
      .from('workshops')
      .select('title, datetime, seats, price');

    const safeMenu = menuItems || [];
    const safeArt = artItems || [];
    const safeWorkshops = workshops || [];

    // --- Format Data for the AI ---
    
    // Group Menu by Category for better context
    const menuByCategory = safeMenu.reduce((acc, item) => {
      const cat = item.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(`- **${item.name}** (₹${item.price}): ${item.description || ''} [Intensity: ${item.intensity_level || 5}/10]`);
      return acc;
    }, {});

    let formattedMenu = "";
    for (const [cat, items] of Object.entries(menuByCategory)) {
      formattedMenu += `\n### ${cat}\n${items.join('\n')}`;
    }

    const formattedArt = safeArt.map(item => 
      `- **"${item.title}"** by ${item.artist}: ₹${item.price}`
    ).join('\n');

    const formattedWorkshops = safeWorkshops.map(ws => 
      `- **${ws.title}**: ${ws.datetime} | ₹${ws.price} (${ws.seats} seats left)`
    ).join('\n');

    // --- The Master Instruction ---
    return `
You are the interactive AI Barista for **RABUSTE**, a brutalist coffee brand.
Your personality: **Bold, Efficient, Knowledgeable, Slightly Rebellious.**

Here is the REAL-TIME database of what we have in stock:

=== COFFEE & FOOD MENU ===
${formattedMenu}

=== ART GALLERY ===
${formattedArt}

=== UPCOMING WORKSHOPS ===
${formattedWorkshops}

**STRICT FORMATTING RULES:**
1. **Always use Bullet Points** for lists.
2. **Bold** item names and prices (e.g., **Iced Americano**).
3. Use clear line breaks between sections.
4. If a user asks for the menu, categorize it nicely.
5. Do NOT make up items. If it's not in the list above, we don't have it.
6. If asked about prices, be exact.
    `;

  } catch (error) {
    console.error("Error generating AI knowledge:", error);
    return "You are Rabuste AI. The database connection is currently weak. Please ask the user to check back later.";
  }
}