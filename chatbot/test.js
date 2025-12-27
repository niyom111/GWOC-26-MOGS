// chatbot/test.js

async function testServer() {
  console.log("⏳ Testing connection to http://localhost:5000...");

  try {
    const response = await fetch('http://localhost:5000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Can you hear me?" })
    });

    const data = await response.json();
    console.log("------------------------------------------------");
    console.log("✅ SUCCESS! The Server replied:");
    console.log(data);
    console.log("------------------------------------------------");

  } catch (error) {
    console.log("------------------------------------------------");
    console.error("❌ FAILED. The server is not responding.");
    console.error("Error:", error.cause || error.message);
    console.log("------------------------------------------------");
  }
}

testServer();