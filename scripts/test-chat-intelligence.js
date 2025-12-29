
const fetch = global.fetch;

async function testIntent(name, message, sessionId, expectedKeywords) {
    try {
        const res = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, sessionId })
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
    console.log("🧠 Starting IQ Test (Memory & Price)...");
    let passed = 0;
    const sessionA = "sess_test_123";

    // 1. Context Set: Tea
    if (await testIntent("Set Context", "suggest a tea", sessionA, ["Tea", "Ginger", "Mint"])) passed++;

    // 2. Context Follow-up + Price
    // Should remember 'tea' and give cheapest one (Lemon/Peach 210 vs Ginger 250)
    // "what about cheapest then"
    if (await testIntent("Follow-up Price", "what about the cheapest then", sessionA, ["Lemon", "Peach", "210"])) passed++;

    // 3. New Context: Food + Expensive
    const sessionB = "sess_test_456";
    if (await testIntent("Expensive Food", "most expensive food", sessionB, ["Pizza", "300"])) passed++;

    console.log(`\n---------------------------------`);
    console.log(`Score: ${passed}/3`);
}

runTests();
