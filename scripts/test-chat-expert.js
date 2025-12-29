
const fetch = global.fetch;

async function testIntent(name, message, expectedKeywords) {
    try {
        const res = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, sessionId: "sess_expert" })
        });
        const data = await res.json();
        const reply = data.reply.toLowerCase();

        const passed = expectedKeywords.some(k => reply.includes(k.toLowerCase()));

        console.log(`\n👉 Testing: ${name} ("${message}")`);
        console.log(`   Reply: ${data.reply.replace(/\n/g, ' ').substring(0, 100)}...`);

        if (passed) console.log(`✅ PASS`);
        else console.error(`❌ FAIL - Expected: ${expectedKeywords.join(', ')}`);
        return passed;
    } catch (e) {
        console.error(`❌ FAIL - API Error: ${e.message}`);
        return false;
    }
}

async function runTests() {
    console.log("🎩 Starting Expert Intelligence Test...");
    let passed = 0;

    // 1. Art Domain Hijack (The confusing case)
    // "Suggest good art" MUST NOT return Fries.
    if (await testIntent("Art Suggestion", "suggest some good art", ["Bloom", "Shift", "painting", "piece"])) passed++;

    // 2. Tired Logic
    // "I'm tired" -> High Caffeine
    if (await testIntent("Tired Mode", "i am so tired suggest something", ["Robco", "Espresso", "Red Bull", "Boost", "Caffeine"])) passed++;

    // 3. Normal Coffee
    if (await testIntent("Normal Coffee", "suggest a coffee", ["Latte", "Mocha", "Robco", "Espresso", "Biscoff", "Americano", "Cappuccino", "White"])) passed++;

    console.log(`\n---------------------------------`);
    console.log(`Score: ${passed}/3`);
}

runTests();
