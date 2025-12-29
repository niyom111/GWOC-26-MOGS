
import Fuse from 'fuse.js';

// 1. Keyword-based Knowledge (Current Fail)
const knowledgeKeywords = [
    { tags: ["story", "about"], response: "Story" },
    { tags: ["franchise", "cost"], response: "Franchise" }
];

// 2. Phrase-based Knowledge (Proposed Fix)
const knowledgePhrases = [
    {
        tags: [
            "tell me your story",
            "what is the brand story",
            "who are you",
            "about the company"
        ],
        response: "Story"
    },
    {
        tags: [
            "how much is a franchise",
            "franchise cost",
            "open a franchise",
            "partner with you"
        ],
        response: "Franchise"
    }
];

const fuseOptions = {
    keys: ['tags'],
    threshold: 0.4,
    includeScore: true,
    ignoreLocation: true
};

console.log("--- TEST 1: Keywords (Current) ---");
const fuse1 = new Fuse(knowledgeKeywords, fuseOptions);
const res1 = fuse1.search("tell me about the story");
console.log(`Query: "tell me about the story" -> Matched: ${res1.length > 0 ? res1[0].item.response : "None"}`);

console.log("\n--- TEST 2: Phrases (Proposed) ---");
const fuse2 = new Fuse(knowledgePhrases, fuseOptions);
const res2 = fuse2.search("tell me about the story");
console.log(`Query: "tell me about the story" -> Matched: ${res2.length > 0 ? res2[0].item.response : "None"}`);
// Should match "tell me your story" or "about the company" close enough?

const res3 = fuse2.search("franchise cost");
console.log(`Query: "franchise cost" -> Matched: ${res3.length > 0 ? res3[0].item.response : "None"}`);

const res4 = fuse2.search("francise cost"); // Typo
console.log(`Query: "francise cost" -> Matched: ${res4.length > 0 ? res4[0].item.response : "None"}`);

