
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
        const passed = expectedKeywords.some(k => reply.includes(k.toLowerCase()));

        console.log(`\n👉 Testing: ${name} ("${message}")`);
        console.log(`   Reply: ${data.reply.replace(/\n/g, ' ')}`);

        if (passed) console.log(`✅ PASS`);
        else console.error(`❌ FAIL - Expected one of: ${expectedKeywords.join(', ')}`);
        return passed;
    } catch (e) {
        console.error(`❌ FAIL - API Error: ${e.message}`);
        return false;
    }
}

async function runTests() {
    console.log("🥪 Starting Context-Aware Recommendation Test...");
    let passed = 0;

    // 1. Food Intent
    if (await testIntent("Food Suggestion", "Suggest a good side", ["Bagel", "Fries", "Wedges", "Croissant", "Pizza", "Nuggets"])) passed++;
    if (await testIntent("Explicit Eat", "I want to eat something", ["Bagel", "Fries", "Wedges", "Croissant", "Pizza"])) passed++;

    // 2. Drink Intent
    if (await testIntent("Drink Suggestion", "Suggest a drink", ["Coffee", "Latte", "Espresso", "Tea", "Mocha", "Robco", "Tonic"])) passed++;

    // 3. Mixed Context
    if (await testIntent("Sweet Food", "Suggest a sweet snack", ["Croissant", "Cookie", "Bagel"])) passed++;

    console.log(`\n---------------------------------`);
    console.log(`Score: ${passed}/4`);
}

runTests();
