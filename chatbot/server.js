import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY is missing in .env file");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 🧠 MENU KNOWLEDGE BASE (Updated from your MenuPage.tsx) ---
const MENU_KQ = `
CURRENT RABUSTE MENU & PRICING (Currency: INR ₹):

ROBUSTA SPECIALTY (COLD - NON MILK)
- Iced Americano: ₹160
- Iced Espresso: ₹130
- Iced Espresso Tonic: ₹250
- Iced Espresso Red Bull: ₹290
- Cranberry Tonic: ₹270

ROBUSTA SPECIALTY (COLD - MILK BASED)
- Iced Latte: ₹220
- Affogato: ₹250
- Classic Frappe: ₹250
- Hazelnut Frappe: ₹260
- Caramel Frappe: ₹260
- Mocha: ₹270
- Biscoff: ₹270
- Vietnamese: ₹240
- Cafe Suda: ₹250
- Robco (Signature): ₹290

HOT CLASSICS
- Hot Americano: ₹150
- Hot Espresso: ₹130
- Hot Latte: ₹190
- Hot Flat White: ₹180
- Hot Cappuccino: ₹180
- Robusta Mocha: ₹230

MANUAL BREWS
- V60 Pour Over (Hot/Cold): ₹220/₹230
- Classic Cold Brew: ₹220
- Cold Brew Tonic: ₹270
- Cold Brew Red Bull: ₹290

SHAKES & TEA
- Chocolate/Biscoff/Nutella Shakes: ₹220-₹260
- Lemon/Peach Ice Tea: ₹210
- Ginger Fizz: ₹250

FOOD & BAGELS
- Fries: ₹150
- Potato Wedges: ₹170
- Veg Nuggets: ₹190
- Pizza: ₹300
- Bagels (Plain/Cream Cheese/Jalapeno/Pesto): ₹100-₹230
- Croissants (Butter/Nutella/Cream Cheese): ₹150-₹240
`;

app.post('/chat', async (req, res) => {
  const { message, history } = req.body;
  
  console.log("📩 User asked:", message);

  try {
    const SYSTEM_INSTRUCTION = `
      You are Rabuste BrewDesk, the official coffee assistant for the Rabuste café website.

      IDENTITY & GREETING RULES:
      1. Your name is "Rabuste BrewDesk".
      2. Greet the user ONLY in the very first message of the conversation.
      3. Do NOT repeat "I'm Rabuste BrewDesk" in every subsequent reply. Just answer the question directly.

      YOUR KNOWLEDGE BASE:
      ${MENU_KQ}

      FORMATTING RULES (CRITICAL):
      - Do NOT use Markdown bolding (like **text**) because it looks messy in the chat window.
      - Use simple dashes (-) for lists.
      - Put every menu item on its own new line.
      - Add an empty line between categories.
      - Keep it clean and vertical.

      ROLE:
      - Suggest drinks based on mood.
      - If asked for the menu, list the categories clearly.
      - If asked about non-coffee topics, politely decline.
    `;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      systemInstruction: SYSTEM_INSTRUCTION 
    });

    const chat = model.startChat({
      history: history || [], 
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    console.log("✅ Bot replied:", text);
    res.json({ reply: text });

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ 
      error: "Failed to fetch response", 
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});