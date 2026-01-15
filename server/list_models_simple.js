import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function listModels() {
    try {
        if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

        // Fetch via fetch to see raw names
        const key = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            const names = data.models.map(m => m.name).join('\n');
            fs.writeFileSync('models_list.txt', names);
            console.log("Written models to models_list.txt");
        } else {
            fs.writeFileSync('models_list.txt', "No models found or error: " + JSON.stringify(data));
        }

    } catch (e) {
        fs.writeFileSync('models_list.txt', "ERROR\n" + e.message);
    }
}

listModels();
