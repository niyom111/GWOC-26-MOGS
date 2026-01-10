
import './env.js';

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No API Key found");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error);
        } else {
            console.log("AVAILABLE MODELS:");
            (data.models || []).forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name} (Version: ${m.version})`);
                }
            });
        }
    } catch (e) {
        console.error("Fetch Error:", e.message);
    }
}

listModels();
