import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize clients
let groq = null;
let gemini = null;

try {
    if (process.env.GROQ_API_KEY) {
        groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        console.log('✅ Groq AI initialized');
    }
} catch (e) {
    console.warn('⚠️ Failed to initialize Groq:', e.message);
}

try {
    if (process.env.GEMINI_API_KEY) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Use a model that supports chat - gemini-pro is standard
        gemini = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log('✅ Gemini AI initialized');
    }
} catch (e) {
    console.warn('⚠️ Failed to initialize Gemini:', e.message);
}

export const isAIReady = !!(groq || gemini);

/**
 * Generates an AI response for the chatbot
 * @param {string} userMessage - The user's message
 * @param {Array} menuItems - List of menu items
 * @param {Array} history - Conversation history
 * @param {Object} extraContext - { workshops, artItems, knowledge }
 * @returns {Promise<string|null>} - The AI response or null if failed
 */
export async function getAIResponse(userMessage, menuItems = [], history = [], extraContext = {}) {
    if (!groq && !gemini) {
        console.warn('❌ No AI clients available (missing keys?)');
        return null;
    }

    // 1. Prepare Context Strings
    const menuList = menuItems.map(item =>
        `- ${item.name} (${item.category}): ₹${item.price} | ${item.calories || 'N/A'} kcal | ${item.description || ''} | Tags: ${item.tags}`
    ).join('\n');

    const workshopList = (extraContext.workshops || []).map(w =>
        `- Workshop: ${w.title} on ${w.date} at ${w.time}. Price: ₹${w.price}. Slots: ${w.remaining}/${w.total_slots}`
    ).join('\n');

    const artList = (extraContext.artItems || []).map(a =>
        `- Art: ${a.title} by ${a.artist}. Price: ₹${a.price}. Status: ${a.status}`
    ).join('\n');

    const staticKnowledge = (extraContext.knowledge || []).map(k =>
        `- Q: ${k.tags[0]}... A: ${k.response}`
    ).join('\n');

    const systemPrompt = `
You remain BrewBot, the friendly AI Barista for "Rabuste Cafe" (reclaiming Robusta beans).
Your goal is to help customers, recommend items, and answer questions about the brand.

**CORE DATA**:
[MENU ITEMS]
${menuList}

[WORKSHOPS]
${workshopList}

[ART GALLERY]
${artList}

[FAQ & KNOWLEDGE]
${staticKnowledge}

**RECOMMENDATION LOGIC (INTERNAL BRAIN)**:
1. **Mood Matching**:
   - Tired/Weak? -> Suggest HIGH CAFFEINE (Espresso, Americano, Red Bull, Cold Brew).
   - Stressed/Comfort? -> Suggest Warm/Milky (Latte, Mocha, Hot Chocolate).
   - Energetic? -> Suggest Light/Refreshing (Tonic, Iced Tea).
   - Working? -> Suggest Clean/Focus drinks (Black Coffee, Pour Over).
2. **Pairing Rules**:
   - Strong Coffee -> Pairs with Sweet/Rich options (Croissant, Cookie) or Heavy (Bagel) to balance bitterness.
   - Light Coffee -> Pairs with Light snacks (Wedges, Fries).
   - If user asks for "strong coffee and a side", find a High Caffeine drink and a matching "Food" item.

**SECURITY & ETHICS (CRITICAL)**:
1. **NO ADMIN ACCESS**: You do NOT know about admin pages, employee shifts, salaries, login credentials, or backend database structures (tables, IDs).
2. If asked about admin stuff, reply: "I'm just a barista! I specifically focus on our menu and events. ☕"
3. Do not fake orders. You cannot place orders directly, just guide them to the menu.

**RESPONSE STYLE**:
- Be friendly, concise (under 50 words unless explaining).
- Use emojis (☕, ✨, 🥐).
- **Format**: use **bold** for Item Names and Prices.
- If suggesting a combo, explain WHY (e.g., "The croissant balances the espresso's bitterness perfectly!").
`;

    // 2. Try Groq (Preferred)
    if (groq) {
        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    ...history.map(msg => ({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.text })),
                    { role: "user", content: userMessage }
                ],
                model: "llama-3.3-70b-versatile", // Updated to supported model
                temperature: 0.7,
                max_tokens: 200,
            });
            return completion.choices[0]?.message?.content || null;
        } catch (error) {
            console.error('⚠️ Groq generation failed:', error.message);
            // Fallthrough to Gemini
        }
    }

    // 3. Try Gemini (Fallback)
    if (gemini) {
        try {
            // Gemini doesn't use "system" role in the same way in v1, but we can prepend it.
            // Or use systemInstruction if supported by the SDK version.
            // Simple approach: Prepend prompt to message.
            const prompt = `${systemPrompt}\n\nUser: ${userMessage}`;
            const result = await gemini.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('⚠️ Gemini generation failed:', error.message);
        }
    }

    return null;
}
