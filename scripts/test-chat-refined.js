
const fetch = global.fetch;

async function testIntent(name, message, expectedKeywords, excludedKeywords = []) {
    try {
        const res = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        const data = await res.json();
        const reply = data.reply.toLowerCase();

        const passedInclude = expectedKeywords.some(k => reply.includes(k.toLowerCase()));
        const passedExclude = excludedKeywords.every(k => !reply.includes(k.toLowerCase()));
        const passed = passedInclude && passedExclude;

        console.log(`\n👉 Testing: ${name} ("${message}")`);
        console.log(`   Reply: ${data.reply.replace(/\n/g, ' ').substring(0, 80)}...`);

        if (passed) console.log(`✅ PASS`);
        else {
            if (!passedInclude) console.error(`❌ FAIL - Expected: ${expectedKeywords.join(', ')}`);
            if (!passedExclude) console.error(`❌ FAIL - Found Forbidden: ${excludedKeywords.join(', ')}`);
        }
        return passed;
    } catch (e) {
        console.error(`❌ FAIL - API Error: ${e.message}`);
        return false;
    }
}

async function runTests() {
    console.log("☕ Starting Refined Intelligence Test...");
    let passed = 0;

    // 1. Strict Coffee Check
    // Should return coffee, NOT Tea. Biscoff/hazelnut are coffee.
    if (await testIntent("Strict Coffee", "suggest me a good coffee", ["Americano", "Latte", "Espresso", "Mocha", "Robco", "Biscoff", "Hazelnut", "Caramel"], ["Tea", "Lemon", "Peach"])) passed++;

    // 2. Implicit Side Request
    // "What about a side" -> Should trigger recs, not I don't know
    if (await testIntent("Implicit Side", "nice what about a side", ["Bagel", "Croissant", "Fries", "Wedges", "Pizza"])) passed++;

    // 3. Strict Tea Check
    if (await testIntent("Strict Tea", "i want a tea", ["Tea", "Ginger", "Mint", "Peach", "Lemon"], ["Espresso", "Latte"])) passed++;

    // 4. Recommendation + Flavor
    if (await testIntent("Spicy Food", "i want something spicy to eat", ["Jalapeno", "Ginger"], [])) passed++;

    console.log(`\n---------------------------------`);
    console.log(`Score: ${passed}/4`);
}

runTests();
