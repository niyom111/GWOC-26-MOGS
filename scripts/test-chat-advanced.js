
const fetch = global.fetch;

async function testIntent(name, message, expectedKeyword) {
    try {
        const res = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        const data = await res.json();
        const passed = data.reply.toLowerCase().includes(expectedKeyword.toLowerCase());
        console.log(`\n👉 Testing: ${name} ("${message}")`);
        console.log(`   Reply: ${data.reply.substring(0, 60)}...`);
        if (passed) console.log(`✅ PASS`);
        else console.error(`❌ FAIL - Expected to find "${expectedKeyword}"`);
        return passed;
    } catch (e) {
        console.error(`❌ FAIL - API Error: ${e.message}`);
        return false;
    }
}

async function runTests() {
    console.log("🤖 Starting Chatbot Intelligence Test...");
    let passed = 0;

    // 1. Static Knowledge Tests
    if (await testIntent("Story", "Tell me your story", "reclamation")) passed++;
    if (await testIntent("Franchise", "I want a franchise", "robustecafe@gmail.com")) passed++;
    if (await testIntent("Contact", "What is your email", "Instagram")) passed++;
    if (await testIntent("Location", "Where are you located", "Surat")) passed++;
    if (await testIntent("Dietary", "Do you have vegan food", "customiz")) passed++;
    if (await testIntent("Help", "Help me", "Recommendations")) passed++;

    // 2. Recommendation Test
    if (await testIntent("Recommendation", "Suggest something sweet", "recommend")) passed++;

    console.log(`\n---------------------------------`);
    console.log(`Score: ${passed}/7`);
}

runTests();
