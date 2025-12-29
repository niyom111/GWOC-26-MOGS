
const fetch = global.fetch; // Node 18+ has native fetch

async function runTests() {
    console.log("🔍 Starting Full Stack Verification...");
    let passed = 0;
    let failed = 0;

    // Test 1: Health / Menu API (Verifies DB Read + Server Running)
    try {
        console.log("👉 Test 1: Checking /api/menu (DB Read)...");
        const res = await fetch('http://localhost:5000/api/menu');
        if (res.status === 200) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                console.log("✅ PASS: Menu data retrieved. Count:", data.length);
                passed++;
            } else {
                console.error("❌ FAIL: Menu data empty or invalid.");
                failed++;
            }
        } else {
            console.error("❌ FAIL: Server returned status", res.status);
            failed++;
        }
    } catch (e) {
        console.error("❌ FAIL: Could not connect to API.", e.cause?.code || e.message);
        failed++;
    }

    // Test 2: Chatbot Recommendation (Verifies Logic + Tags)
    try {
        console.log("\n👉 Test 2: Checking /api/chat (Recommendation Engine)...");
        const res = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "suggest something sweet" })
        });
        const data = await res.json();
        if (data.reply && data.reply.includes("recommend")) {
            console.log("✅ PASS: Chatbot made a suggestion.");
            console.log("   Reply:", data.reply);
            passed++;
        } else {
            console.error("❌ FAIL: Chatbot did not return a valid recommendation.");
            console.log("   Reply:", data);
            failed++;
        }
    } catch (e) {
        console.error("❌ FAIL: Chatbot API failed.", e.cause?.code || e.message);
        failed++;
    }

    // Test 3: Environment Check
    // We can't easily check internal env vars from outside, but passing the above means env is likely fine.

    console.log("\n---------------------------------------------------");
    console.log(`📊 Result: ${passed} PASSED, ${failed} FAILED`);

    if (failed === 0) {
        console.log("✅ SYSTEM HEALTHY");
    } else {
        console.log("⚠️ SYSTEM HAS ISSUES");
    }
}

runTests();
