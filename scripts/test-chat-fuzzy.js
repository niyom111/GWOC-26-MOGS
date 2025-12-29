
const fetch = global.fetch;

async function testIntent(name, message, expectedKeywords) {
    try {
        const res = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        const data = await res.json();
        const reply = data.reply.toLowerCase();

        // Check if ANY of the expected keywords are present
        const passed = expectedKeywords.some(k => reply.includes(k.toLowerCase()));

        console.log(`\n👉 Testing: ${name} ("${message}")`);
        console.log(`   Reply: ${data.reply.replace(/\n/g, ' ').substring(0, 100)}...`);

        if (passed) console.log(`✅ PASS`);
        else console.error(`❌ FAIL - Expected one of: ${expectedKeywords.join(', ')}`);
        return passed;
    } catch (e) {
        console.error(`❌ FAIL - API Error: ${e.message}`);
        return false;
    }
}

async function runTests() {
    console.log("🧠 Starting Fuse.js NLP Verification...");
    let passed = 0;

    // 1. Exact Match (Baseline)
    if (await testIntent("Baseline", "tell me about the story", ["reclamation", "surat"])) passed++;

    // 2. Fuzzy / Typo Match
    if (await testIntent("Typo Franchise", "francise cost", ["robustecafe@gmail.com", "partner"])) passed++;
    if (await testIntent("Typo Wifi", "do you have wifii", ["high-speed", "internet"])) passed++;
    if (await testIntent("Natural Language", "can i bring my dog", ["pet-friendly", "pets"])) passed++;

    // 3. Recommendation (Still Works)
    if (await testIntent("Context Rec", "suggest a side", ["bagel", "croissant"])) passed++;

    console.log(`\n---------------------------------`);
    console.log(`Score: ${passed}/5`);
}

runTests();
