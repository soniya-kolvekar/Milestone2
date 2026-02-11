const https = require('https');

const apiKey = 'AIzaSyABoTZxIRqXoGAXTf0s6KACR2PvUCYt-Bk';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

const req = https.get(url, (res) => {
    let responseBody = '';

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        try {
            const parsed = JSON.parse(responseBody);
            console.log('Models:', JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.log('Response Body:', responseBody);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
