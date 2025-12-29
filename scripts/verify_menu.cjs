
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/menu',
    method: 'GET',
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const menuItems = JSON.parse(data);
            console.log(`Total Menu Items: ${menuItems.length}`);

            // Check for specific new items
            const specificItems = [
                'Iced Espresso Tonic',
                'Iced Espresso Ginger Ale',
                'Iced Espresso Orange',
                'Robco'
            ];

            specificItems.forEach(name => {
                const item = menuItems.find(i => i.name === name);
                if (item) {
                    console.log(`Found: ${item.name} | Category: ${item.category} | Price: ${item.price}`);
                } else {
                    console.error(`Missing: ${name}`);
                }
            });

        } catch (e) {
            console.error('Error parsing JSON:', e.message);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
