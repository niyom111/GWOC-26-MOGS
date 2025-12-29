
const URL = 'http://localhost:5000/api/art';

async function testPersistence() {
    console.log("--> Starting Persistence Test...");

    // 1. ADD ITEM
    const newItem = {
        id: `test-${Date.now()}`,
        title: "Persistence Test Art",
        price: 9999,
        status: "Available",
        image: "/media/pic1.jpeg",
        stock: 5
    };

    console.log(`[POST] Adding item: ${newItem.title}`);
    const postRes = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
    });

    if (!postRes.ok) {
        console.error("!! POST Failed:", await postRes.text());
        return;
    }
    const posted = await postRes.json();
    console.log("   POST Success:", posted);

    // 2. GET ITEMS
    console.log("[GET] Fetching all items...");
    const getRes = await fetch(URL);
    if (!getRes.ok) {
        console.error("!! GET Failed:", await getRes.text());
        return;
    }
    const allItems = await getRes.json();
    const found = allItems.find(i => i.id === newItem.id);

    if (found) {
        console.log("   ✅ SUCCESS: Item found in database!");
        console.log("   Item:", found);
    } else {
        console.error("   ❌ FAILURE: Item NOT found but POST succeeded!");
    }

    // 3. DELETE ITEM
    if (found) {
        console.log(`[DELETE] Removing test item ${newItem.id}...`);
        const delRes = await fetch(`${URL}/${newItem.id}`, { method: 'DELETE' });
        if (delRes.ok) {
            console.log("   DELETE Success.");
        } else {
            console.error("!! DELETE Failed:", await delRes.text());
        }
    }
}

testPersistence().catch(err => console.error("Script Error:", err));
