
// Uses native fetch (Node 18+)

async function testStatusUpdate() {
    try {
        console.log("1. Creating dummy enquiry...");
        const createRes = await fetch('http://localhost:5000/api/franchise/enquire', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                full_name: 'Test Debugger',
                contact_number: '1234567890',
                email: 'debug@test.com',
                enquiry: 'Testing status update'
            })
        });

        if (!createRes.ok) {
            console.error("Failed to create enquiry:", await createRes.text());
            return;
        }

        const createData = await createRes.json();
        const id = createData.id;
        console.log("Enquiry created with ID:", id);

        console.log("2. Attempting to update status to 'Contacted'...");
        const updateRes = await fetch(`http://localhost:5000/api/franchise/enquiries/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Contacted' })
        });

        if (updateRes.ok) {
            console.log("SUCCESS: Status updated successfully.");
        } else {
            console.log("FAILURE_CODE: " + updateRes.status);
            console.log("FAILURE_BODY: " + await updateRes.text());
        }

        // Cleanup
        console.log("3. Cleaning up...");
        await fetch(`http://localhost:5000/api/franchise/enquiries/${id}`, { method: 'DELETE' });

    } catch (e) {
        console.error("EXCEPTION:", e);
    }
}

testStatusUpdate();
