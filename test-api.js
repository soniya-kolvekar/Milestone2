const https = require('https');

const apiKey = process.env.GEMINI_API_KEY;
const model = 'text-bison-001';
const url = `https://generativelanguage.googleapis.com/v1beta2/models/${model}:generateText?key=${apiKey}`;

const data = JSON.stringify({
    prompt: { text: "Explain the long-term impact of this habit: drinking water" },
    temperature: 0.7,
    max_output_tokens: 300
});

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    }
};

const req = https.request(url, options, (res) => {
    let responseBody = '';

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response Body:', responseBody);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
