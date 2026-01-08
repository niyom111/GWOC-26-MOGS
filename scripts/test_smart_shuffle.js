
async function testShuffle() {
    const url = 'http://localhost:5000/api/recommendations/context';
    // Case: Work + Energetic (Expects Light/Medium Coffee + Light Snack)
    const payload = { mood: 'Energetic', activity: 'Work' };

    console.log('🧪 Testing Smart Shuffle for:', payload);
    console.log('   Running 5 requests to check for variety...\n');

    const results = [];

    for (let i = 0; i < 5; i++) {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.error) {
                console.error('❌ Error:', data.error);
                continue;
            }

            const coffee = data.coffee ? `${data.coffee.name} (${data.coffee.caffeine_mg}mg)` : 'None';
            const snack = data.snack ? `${data.snack.name} (${data.snack.calories}kcal)` : 'None';

            console.log(`   Attempt ${i + 1}: ☕ ${coffee}  +  🍪 ${snack}`);
            results.push({ coffee: data.coffee?.name, snack: data.snack?.name });
        } catch (e) {
            console.error('❌ Connection failed:', e.message);
        }
    }

    // Analysis
    const uniqueCoffees = new Set(results.map(r => r.coffee).filter(Boolean));
    const uniqueSnacks = new Set(results.map(r => r.snack).filter(Boolean));

    console.log('\n📊 Results Analysis:');
    console.log(`   Unique Coffees suggested: ${uniqueCoffees.size}/5`);
    console.log(`   Unique Snacks suggested: ${uniqueSnacks.size}/5`);

    if (uniqueCoffees.size > 1 || uniqueSnacks.size > 1) {
        console.log('✅ PASS: Smart Shuffle is providing variety!');
    } else {
        console.warn('⚠️ WARNING: Low variety observed. (Might be due to data limitation or scoring gap)');
    }
}

testShuffle();
