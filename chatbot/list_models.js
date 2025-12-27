// chatbot/list_models.js
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function getAvailableModels() {
  if (!API_KEY) {
    console.error("❌ Error: GEMINI_API_KEY is missing from .env file");
    return;
  }

  console.log("🔍 Asking Google for available models...");

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("❌ API Error:", data.error.message);
      return;
    }

    console.log("\n✅ AVAILABLE MODELS FOR YOUR KEY:");
    console.log("-----------------------------------");
    
    // Filter to only show "generateContent" models (the ones for chatbots)
    const chatModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
    
    chatModels.forEach(model => {
      // Print the simplified name (e.g., "gemini-1.5-flash")
      console.log(`🔹 ${model.name.replace("models/", "")}`);
    });

    console.log("-----------------------------------");
    console.log("👉 Pick one of the names above and put it in server.js!");

  } catch (error) {
    console.error("❌ Connection Failed:", error.message);
  }
}

getAvailableModels();