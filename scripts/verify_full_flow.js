
const URL_ART = 'http://localhost:5000/api/art';
const URL_ORDER = 'http://localhost:5000/api/orders';

async function verifyFullFlow() {
    console.log("--> Starting Full Persistence Verification...");

    // 1. ADD ART ITEM
    const newArt = {
        id: `auto-art-${Date.now()}`,
        title: "Automated Test Art",
        price: 5000,
        status: "Available",
        image: "/media/pic1.jpeg",
        stock: 3
    };

    console.log(`[POST] Creating Art: ${newArt.title}`);
    const artRes = await fetch(URL_ART, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArt)
    });

    if (!artRes.ok) console.error("!! POST Art Failed");
    else console.log("   POST Art Success");

    // 2. PLACE ORDER
    const newOrder = {
        customer: { name: "Test User", phone: "1234567890", email: "test@example.com" },
        items: [{ id: newArt.id, name: newArt.title, price: newArt.price, quantity: 1 }],
        total: 5000,
        pickupTime: "12:00"
    };

    console.log(`[POST] Placing Order...`);
    const orderRes = await fetch(URL_ORDER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
    });

    if (!orderRes.ok) console.error("!! POST Order Failed");
    else {
        const orderData = await orderRes.json();
        console.log("   POST Order Success. ID:", orderData.id);

        // 3. VERIFY ORDER IN HISTORY
        console.log("[GET] Fetching Orders History...");
        const histRes = await fetch(URL_ORDER);
        const history = await histRes.json();
        const foundOrder = history.find(o => o.id === orderData.id);

        if (foundOrder) console.log("   ✅ SUCCESS: Order found in history!");
        else console.error("   ❌ FAILURE: Order NOT found in history.");
    }

    // 4. VERIFY ART IN GALLERY
    const galleryRes = await fetch(URL_ART);
    const gallery = await galleryRes.json();
    const foundArt = gallery.find(a => a.id === newArt.id);
    if (foundArt) console.log("   ✅ SUCCESS: Art found in gallery!");
    else console.error("   ❌ FAILURE: Art NOT found in gallery.");

}

verifyFullFlow().catch(console.error);
