/**
 * Generates dynamic knowledge entries from database items
 * This allows the chatbot to answer questions about menu items, art pieces, and workshops
 */

export async function generateKnowledgeFromDatabase(db) {
    const knowledgeEntries = [];

    try {
        // Generate knowledge from menu items
        const { data: menuRows, error: menuError } = await db
            .from('menu_items')
            .select('*');

        if (menuError) {
            console.error("Error fetching menu items for knowledge:", menuError);
        } else {
            // Generate knowledge entries for each menu item
            (menuRows || []).forEach(item => {
                const name = item.name || '';
                const nameLower = name.toLowerCase();
                const category = item.category || '';
                const price = item.price || 0;
                const tags = item.tags || '';
                const description = item.description || '';
                const caffeine = item.caffeine || '';

                // Create tags array from item data
                const entryTags = [
                    nameLower,
                    nameLower.replace(/\s+/g, ' '), // normalized spacing
                ];

                // Add category keywords
                if (category) {
                    const categoryWords = category.toLowerCase().split(/\s+/);
                    entryTags.push(...categoryWords.filter(w => w.length > 2));
                }

                // Add tags from database
                if (tags) {
                    const tagArray = tags.split(',').map(t => t.trim().toLowerCase());
                    entryTags.push(...tagArray);
                }

                // Add common variations
                if (nameLower.includes('iced')) {
                    entryTags.push('cold', 'cold coffee');
                }
                if (nameLower.includes('hot')) {
                    entryTags.push('hot coffee', 'warm');
                }
                if (nameLower.includes('latte')) {
                    entryTags.push('latte', 'milk coffee');
                }
                if (nameLower.includes('americano')) {
                    entryTags.push('americano', 'black coffee');
                }
                if (nameLower.includes('espresso')) {
                    entryTags.push('espresso', 'shot');
                }

                // Build response
                let response = `The **${name}** (₹${price})`;
                if (category) {
                    response += ` is a ${category}`;
                }
                if (description) {
                    response += `. ${description}`;
                }
                if (tags) {
                    const keyTags = tags.split(',').slice(0, 3).map(t => t.trim()).join(', ');
                    response += ` It's ${keyTags}.`;
                }
                if (caffeine) {
                    response += ` Caffeine level: ${caffeine}.`;
                }

                knowledgeEntries.push({
                    tags: [...new Set(entryTags)], // Remove duplicates
                    response: response
                });

                // Add specific question variations
                knowledgeEntries.push({
                    tags: [`what is ${nameLower}`, `${nameLower} price`, `how much is ${nameLower}`, `tell me about ${nameLower}`],
                    response: response
                });
            });
        }

        // Generate knowledge from art items (only available ones)
        const { data: artRows, error: artError } = await db
            .from('art_items')
            .select('*')
            .eq('status', 'Available');

        if (artError) {
            console.error("Error fetching art items for knowledge:", artError);
        } else {
            (artRows || []).forEach(item => {
                const title = item.title || '';
                const artist = item.artist_name || item.artist || '';
                const price = item.price || 0;
                const titleLower = title.toLowerCase();
                const artistLower = artist.toLowerCase();

                const entryTags = [
                    titleLower,
                    artistLower,
                    'art',
                    'gallery',
                    'painting',
                    'art piece',
                    `art by ${artistLower}`,
                    `${titleLower} by ${artistLower}`
                ];

                const response = `**"${title}"** by ${artist} is available in our gallery for ₹${price}. It's a stunning piece that would make a great addition to any collection.`;

                knowledgeEntries.push({
                    tags: entryTags,
                    response: response
                });

                // Add specific question variations
                knowledgeEntries.push({
                    tags: [`what is ${titleLower}`, `tell me about ${titleLower}`, `${titleLower} price`, `art by ${artistLower}`],
                    response: response
                });
            });
        }

        // Generate knowledge from workshops
        const { data: workshopRows, error: workshopError } = await db
            .from('workshops')
            .select('*');

        if (workshopError) {
            console.error("Error fetching workshops for knowledge:", workshopError);
        } else {
            (workshopRows || []).forEach(item => {
                const title = item.title || '';
                const datetime = item.datetime || '';
                const price = item.price || 0;
                const seats = item.seats || 0;
                const booked = item.booked || 0;
                const available = seats - booked;
                const titleLower = title.toLowerCase();

                const entryTags = [
                    titleLower,
                    'workshop',
                    'class',
                    'course',
                    'learn',
                    'training',
                    `${titleLower} workshop`
                ];

                let response = `**${title}** is an upcoming workshop on ${datetime}`;
                if (price > 0) {
                    response += ` for ₹${price}`;
                } else {
                    response += ` (free)`;
                }
                if (available > 0) {
                    response += `. ${available} seats available out of ${seats} total.`;
                } else {
                    response += `. Currently SOLD OUT.`;
                }

                knowledgeEntries.push({
                    tags: entryTags,
                    response: response
                });

                // Add specific question variations
                knowledgeEntries.push({
                    tags: [`what is ${titleLower}`, `tell me about ${titleLower}`, `${titleLower} workshop`, `workshop ${titleLower}`],
                    response: response
                });
            });
        }

        return knowledgeEntries;
    } catch (error) {
        console.error("Error generating knowledge from database:", error);
        return knowledgeEntries; // Return what we have so far
    }
}
