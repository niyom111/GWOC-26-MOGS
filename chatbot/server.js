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

const MENU_KQ = `
CURRENT RABUSTE MENU:

ROBUSTA SPECIALTY
• Iced Americano: ₹160 (5 kcal)
• Iced Espresso: ₹130 (5 kcal)
• Iced Espresso Tonic: ₹250 (70 kcal)
• Iced Espresso Red Bull: ₹290 (115 kcal)
• Cranberry Tonic: ₹270 (90 kcal)

MILK BASED
• Iced Latte: ₹220 (180 kcal)
• Affogato: ₹250 (250 kcal)
• Classic Frappe: ₹250 (350 kcal)
• Hazelnut Frappe: ₹260 (380 kcal)
• Mocha: ₹270 (320 kcal)
• Vietnamese: ₹240 (250 kcal)

FOOD & SNACKS
• Fries: ₹150 (320 kcal)
• Potato Wedges: ₹170 (290 kcal)
• Pizza: ₹300 (600 kcal)
• Bagels: ₹100-150 (240+ kcal)
• Croissants: ₹150 (280 kcal)

NAVIGATION:
- Menu Page: /menu
- Workshops: /workshops
- Art Gallery: /art
- About Us: /about
`;

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    You are "Rabuste Bot".
    
    KNOWLEDGE BASE:
    ${MENU_KQ}

    STRICT FORMATTING RULES:
    1. DO NOT use asterisks (**) anywhere.
    2. DO NOT use bold text.
    3. Use simple bullets (•) for lists.
    4. Put every item on a new line.
    5. Keep it clean and simple.

    YOUR GOAL:
    1. Answer questions about menu/calories.
    2. If user says "Go to menu" etc, output JSON: {"action": "navigate", "parameters": {"route": "/menu"}}

    User Message: "${message}"
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();

    // --- THE FIX: FORCEFULLY REMOVE ASTERSISKS & CLEANUP ---
    responseText = responseText
      .replace(/\*\*/g, '')   // Remove **
      .replace(/\*/g, '•')    // Replace single * with bullet
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let apiResponse;
    try {
      if (responseText.startsWith('{') && responseText.includes('"action": "navigate"')) {
        apiResponse = JSON.parse(responseText);
      } else {
        apiResponse = {
          action: 'respond',
          parameters: { message: responseText }
        };
      }
    } catch (e) {
      apiResponse = {
        action: 'respond',
        parameters: { message: responseText }
      };
    }

    res.json(apiResponse);

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ 
      error: "Connection error. Please try again." 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Clean Server running on http://localhost:${PORT}`);
});