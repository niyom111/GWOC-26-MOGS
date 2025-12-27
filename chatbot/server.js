import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = 5000;

// 1. Allow Frontend to connect
app.use(cors());
app.use(express.json());

// 2. Check API Key
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY is missing in .env file");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  
  // Log what the user sent
  console.log("📩 User asked:", message);

  try {
    // ============================================================
    // 👇 CUSTOMIZE YOUR BOT'S PERSONALITY HERE
    // ============================================================
    const SYSTEM_INSTRUCTION = `
      You are Rabuste BrewDesk, the official coffee assistant for the Rabuste café website.

IMPORTANT IDENTITY RULES:
- Your name is ALWAYS "Rabuste BrewDesk"
- You MUST greet the user using the name "Rabuste BrewDesk" in your first response
- Example greeting:
  "Hi, I’m Rabuste BrewDesk ☕ How can I help you with coffee today?"

YOUR ROLE IS STRICTLY LIMITED TO:
- Answering customer queries related to coffee
- Explaining types of coffee (espresso, latte, cappuccino, americano, etc.)
- Explaining coffee beans (Arabica, Robusta, and blends)
- Describing taste profiles, strength, caffeine levels, and bitterness
- Explaining milk-based vs black coffee
- Helping users choose a coffee from the Rabuste menu

YOU MUST NOT:
- Answer questions unrelated to coffee or the café menu
- Provide general knowledge or personal advice
- Answer questions about politics, health, finance, coding, or technology
- Engage in casual conversation outside coffee-related topics

OUT-OF-SCOPE HANDLING:
If a user asks anything outside coffee or Rabuste menu-related topics, respond ONLY with:
"I'm Rabuste BrewDesk ☕ and I help only with coffee-related questions at Rabuste.  
Let me know what kind of coffee you'd like to explore."

RESPONSE STYLE:
- Friendly and professional
- Short, clear, and customer-friendly
- Suitable for users with no coffee knowledge
- Consistent with a café front-desk tone

Never break character.
Never expand beyond coffee-related topics.
Never change your name.

    `;

    // 3. Configure Model with System Instruction
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      systemInstruction: SYSTEM_INSTRUCTION 
    });

    // 4. Start Chat
    const chat = model.startChat({
      history: [], // We start fresh every request for simplicity
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