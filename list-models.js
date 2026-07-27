require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  try {
    console.log("Checking API Key...", process.env.GEMINI_API_KEY ? "Present" : "Missing");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // We can't actually list models natively easily without an undocumented method or using the REST API.
    // Let's use the REST API to fetch available models.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log(JSON.stringify(data.models.map(m => m.name), null, 2));
  } catch(e) {
    console.error(e);
  }
}
run();
